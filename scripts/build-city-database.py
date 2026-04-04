#!/usr/bin/env python3
"""
Build unified city database from all SafeSpace research JSON files.
Outputs src/data/cities-all.json — consumed by the app at build time.
"""
import json
import os
import sys
from pathlib import Path

RESEARCH_DIR = Path.home() / ".openclaw/workspace/research"
OUTPUT = Path(__file__).parent.parent / "src/data/cities-all.json"

def slugify(city: str, state: str) -> str:
    slug = city.lower().replace(" ", "-").replace(".", "").replace("'", "")
    # Handle duplicates by appending state
    return f"{slug}-{state.lower()}"

def normalize_city(raw: dict, state_laws: dict) -> dict:
    """Normalize a city entry to a consistent schema."""
    state = raw.get("state", raw.get("stateCode", ""))
    city = raw.get("city", raw.get("name", ""))
    
    # Get state-level data if available
    state_data = state_laws.get(state, {})
    state_score = state_data.get("tenant_protection_score", 0)
    
    # Normalize score
    score = raw.get("tenantProtectionScore", raw.get("tenant_protection_score", state_score))
    if isinstance(score, str):
        try:
            score = int(score.split("/")[0])
        except:
            score = 3
    
    # Normalize laws
    laws = []
    raw_laws = raw.get("keyTenantLaws", raw.get("key_tenant_laws", []))
    for law in raw_laws[:6]:
        if isinstance(law, dict):
            laws.append({
                "name": law.get("name", law.get("citation", "Local ordinance")),
                "citation": law.get("citation", ""),
                "summary": law.get("summary", law.get("description", "")),
            })
    
    # Normalize deadlines
    deadlines = raw.get("repairDeadlines", raw.get("repair_deadlines", {}))
    if isinstance(deadlines, dict):
        norm_deadlines = {
            "emergency": deadlines.get("emergency", "24 hours"),
            "urgent": deadlines.get("urgent", "72 hours"),
            "standard": deadlines.get("standard", "30 days"),
        }
    else:
        norm_deadlines = {"emergency": "24 hours", "urgent": "72 hours", "standard": "30 days"}
    
    # Normalize enforcement
    enforcement = raw.get("enforcementContacts", raw.get("enforcement", {}))
    health_dept = enforcement.get("healthDept", enforcement.get("health_dept", {}))
    code_enf = enforcement.get("codeEnforcement", enforcement.get("code_enforcement", {}))
    
    # Normalize deposit rules
    deposit = raw.get("securityDepositRules", raw.get("security_deposit_rules", ""))
    if isinstance(deposit, dict):
        deposit = deposit.get("details", deposit.get("limit", str(deposit)))
    
    return {
        "slug": slugify(city, state),
        "city": city,
        "state": state,
        "population": raw.get("population", 0),
        "tenantProtectionScore": score,
        "rentControlExists": raw.get("rentControlExists", raw.get("rent_control_exists", False)),
        "justCauseEviction": raw.get("justCauseEviction", raw.get("just_cause_eviction", False)),
        "retaliationProtection": raw.get("retaliationProtection", raw.get("retaliation_protection", True)),
        "keyLaws": laws,
        "repairDeadlines": norm_deadlines,
        "securityDepositRules": str(deposit) if deposit else "",
        "enforcement": {
            "healthDept": {
                "name": health_dept.get("name", ""),
                "phone": health_dept.get("phone", ""),
            } if isinstance(health_dept, dict) else {"name": "", "phone": ""},
            "codeEnforcement": {
                "name": code_enf.get("name", ""),
                "phone": code_enf.get("phone", ""),
            } if isinstance(code_enf, dict) else {"name": "", "phone": ""},
        },
    }

def load_json_safe(path: Path) -> list:
    """Load JSON, handling truncated files."""
    try:
        data = json.loads(path.read_text())
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return data.get("cities", data.get("states", []))
        return []
    except json.JSONDecodeError:
        # Try to recover truncated arrays
        raw = path.read_text()
        arr_start = raw.find("[")
        if arr_start < 0:
            return []
        objects = []
        i = arr_start + 1
        while i < len(raw):
            while i < len(raw) and raw[i] in " \n\r\t,":
                i += 1
            if i >= len(raw) or raw[i] == "]":
                break
            if raw[i] == "{":
                depth = 0
                obj_start = i
                for j in range(i, len(raw)):
                    if raw[j] == "{": depth += 1
                    elif raw[j] == "}": depth -= 1
                    if depth == 0:
                        try:
                            objects.append(json.loads(raw[obj_start:j+1]))
                        except:
                            pass
                        i = j + 1
                        break
                else:
                    break
            else:
                i += 1
        return objects

def main():
    # Load state laws
    state_laws = {}
    state_path = RESEARCH_DIR / "safespace-state-laws.json"
    if state_path.exists():
        data = json.loads(state_path.read_text())
        for s in data.get("states", data if isinstance(data, list) else []):
            abbr = s.get("abbreviation", s.get("stateCode", ""))
            if abbr:
                state_laws[abbr] = s

    # Load all city files
    city_files = [
        "safespace-100-cities.json",
        "safespace-major-cities.json",
        "safespace-midsize-cities.json",
        "safespace-100k-cities.json",
        "safespace-micro-cities.json",
        "safespace-micro-cities-fixed.json",
        "safespace-small-cities.json",
    ]

    all_cities = []
    seen = set()

    for fname in city_files:
        path = RESEARCH_DIR / fname
        if not path.exists():
            continue
        cities = load_json_safe(path)
        added = 0
        for c in cities:
            city_name = c.get("city", c.get("name", ""))
            state = c.get("state", c.get("stateCode", ""))
            key = f"{city_name}-{state}"
            if key not in seen and city_name:
                seen.add(key)
                all_cities.append(normalize_city(c, state_laws))
                added += 1
        print(f"  {fname}: +{added} cities")

    # Sort by state then city
    all_cities.sort(key=lambda c: (c["state"], c["city"]))

    # Build state summaries from state_laws
    states = []
    for abbr, data in sorted(state_laws.items()):
        states.append({
            "abbreviation": abbr,
            "state": data.get("state", ""),
            "tenantProtectionScore": data.get("tenant_protection_score", 3),
            "rentControl": data.get("rent_control", {}),
            "securityDeposit": data.get("security_deposit", {}),
            "eviction": data.get("eviction", {}),
            "retaliationProtection": data.get("retaliation_protection", False),
        })

    output = {
        "generated": "2026-04-03",
        "totalCities": len(all_cities),
        "totalStates": len(states),
        "cities": all_cities,
        "states": states,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2))
    print(f"\n✅ Written {len(all_cities)} cities + {len(states)} states to {OUTPUT}")
    print(f"   File size: {OUTPUT.stat().st_size / 1024:.0f}KB")

if __name__ == "__main__":
    main()
