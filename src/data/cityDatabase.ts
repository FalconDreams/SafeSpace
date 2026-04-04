/**
 * Unified city database — merges deep-data cities (cityRegistry) with
 * 451-city research database for national coverage.
 */
import { getSupportedCities, getCityBySlug, type CityEntry } from './cityRegistry';
import allCitiesData from './cities-all.json';

export interface ResearchCity {
  slug: string;
  city: string;
  state: string;
  population: number;
  tenantProtectionScore: number;
  rentControlExists: boolean;
  justCauseEviction: boolean;
  retaliationProtection: boolean | string;
  keyLaws: Array<{ name: string; citation: string; summary: string }>;
  repairDeadlines: { emergency: string; urgent: string; standard: string };
  securityDepositRules: string;
  enforcement: {
    healthDept: { name: string; phone: string };
    codeEnforcement: { name: string; phone: string };
  };
}

export interface StateProfile {
  abbreviation: string;
  state: string;
  tenantProtectionScore: number;
  rentControl: Record<string, unknown>;
  securityDeposit: Record<string, unknown>;
  eviction: Record<string, unknown>;
  retaliationProtection: unknown;
}

interface AllCitiesData {
  totalCities: number;
  totalStates: number;
  cities: ResearchCity[];
  states: StateProfile[];
}

const data = allCitiesData as unknown as AllCitiesData;

// Index by slug for fast lookup
const researchIndex = new Map<string, ResearchCity>();
const cityNameIndex = new Map<string, ResearchCity>();
for (const c of data.cities) {
  researchIndex.set(c.slug, c);
  cityNameIndex.set(`${c.city.toLowerCase()}-${c.state.toLowerCase()}`, c);
}

const stateIndex = new Map<string, StateProfile>();
for (const s of data.states) {
  stateIndex.set(s.abbreviation, s);
}

/** Deep-data cities (11 with full enforcement contacts, rights, emergency info) */
export function getDeepCities(): CityEntry[] {
  return getSupportedCities();
}

/** Get a deep-data city by slug */
export function getDeepCity(slug: string): CityEntry | undefined {
  return getCityBySlug(slug);
}

/** Get a research city by slug */
export function getResearchCity(slug: string): ResearchCity | undefined {
  return researchIndex.get(slug);
}

/** Get research city by name + state */
export function getResearchCityByName(city: string, state: string): ResearchCity | undefined {
  return cityNameIndex.get(`${city.toLowerCase()}-${state.toLowerCase()}`);
}

/** Get state profile */
export function getStateProfile(stateCode: string): StateProfile | undefined {
  return stateIndex.get(stateCode);
}

/** Get all research cities */
export function getAllResearchCities(): ResearchCity[] {
  return data.cities;
}

/** Get research cities by state */
export function getCitiesByState(stateCode: string): ResearchCity[] {
  return data.cities.filter(c => c.state === stateCode);
}

/** Search cities by name (fuzzy prefix match) */
export function searchCities(query: string): ResearchCity[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return data.cities
    .filter(c => c.city.toLowerCase().startsWith(q) || c.city.toLowerCase().includes(q))
    .slice(0, 20);
}

/** Check if a city has deep data (full rights, contacts, etc.) */
export function hasDeepData(citySlug: string): boolean {
  return !!getCityBySlug(citySlug);
}

/** Total stats */
export function getStats() {
  return {
    totalCities: data.totalCities,
    totalStates: data.totalStates,
    deepCities: getSupportedCities().length,
  };
}

/** Get all states with at least one researched city */
export function getStatesWithCities(): Array<{ code: string; name: string; count: number; score: number }> {
  const stateCounts = new Map<string, number>();
  for (const c of data.cities) {
    stateCounts.set(c.state, (stateCounts.get(c.state) || 0) + 1);
  }
  
  return Array.from(stateCounts.entries())
    .map(([code, count]) => ({
      code,
      name: stateIndex.get(code)?.state || code,
      count,
      score: stateIndex.get(code)?.tenantProtectionScore || 0,
    }))
    .sort((a, b) => b.count - a.count);
}
