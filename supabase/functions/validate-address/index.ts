import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const USPS_TOKEN_URL = "https://apis.usps.com/oauth2/v3/token";
const USPS_ADDRESS_URL = "https://apis.usps.com/addresses/v3/address";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getUSPSToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = Deno.env.get("USPS_CONSUMER_KEY");
  const clientSecret = Deno.env.get("USPS_CONSUMER_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("USPS credentials not configured");
  }

  const resp = await fetch(USPS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!resp.ok) {
    throw new Error(`USPS OAuth failed: ${resp.status}`);
  }

  const data = await resp.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + 7 * 60 * 60 * 1000,
  };

  return cachedToken.token;
}

// ── Supported cities: zip code → city slug ──
const SUPPORTED_CITIES: Record<string, string> = {};

function addZipRange(start: number, end: number, slug: string) {
  for (let z = start; z <= end; z++) {
    SUPPORTED_CITIES[String(z).padStart(5, "0")] = slug;
  }
}

// Boulder, CO
for (const z of ["80301","80302","80303","80304","80305","80306","80307","80308","80309","80310","80314","80321","80322","80323","80328","80329","80455","80466","80471","80481","80501","80503","80504","80510","80513","80516","80520","80540","80544"]) {
  SUPPORTED_CITIES[z] = "boulder";
}
// Fort Collins, CO
addZipRange(80521, 80528, "fort-collins");
SUPPORTED_CITIES["80553"] = "fort-collins";
// Ann Arbor, MI
addZipRange(48103, 48109, "ann-arbor");
SUPPORTED_CITIES["48113"] = "ann-arbor";
// Eugene, OR
addZipRange(97401, 97408, "eugene");
SUPPORTED_CITIES["97440"] = "eugene";
// Santa Cruz, CA
addZipRange(95060, 95067, "santa-cruz");
// Somerville, MA
addZipRange(2143, 2145, "somerville");
// Olympia, WA
addZipRange(98501, 98509, "olympia");
SUPPORTED_CITIES["98516"] = "olympia";
// Portland, ME
addZipRange(4101, 4104, "portland-me");
SUPPORTED_CITIES["04108"] = "portland-me";
SUPPORTED_CITIES["04109"] = "portland-me";
SUPPORTED_CITIES["04112"] = "portland-me";
// Asheville, NC
addZipRange(28801, 28806, "asheville");
SUPPORTED_CITIES["28810"] = "asheville";
addZipRange(28813, 28816, "asheville");
// Burlington, VT
addZipRange(5401, 5408, "burlington");
// Ithaca, NY
addZipRange(14850, 14853, "ithaca");
SUPPORTED_CITIES["14882"] = "ithaca";

function findSupportedCity(zip: string, cityName: string, state: string): string | null {
  const byZip = SUPPORTED_CITIES[zip];
  if (byZip) return byZip;

  // Fallback: city name + state match
  const cityLower = (cityName || "").toLowerCase().trim();
  const stateUpper = (state || "").toUpperCase().trim();
  const cityMap: Record<string, { name: string; state: string }> = {
    "boulder": { name: "boulder", state: "CO" },
    "fort-collins": { name: "fort collins", state: "CO" },
    "ann-arbor": { name: "ann arbor", state: "MI" },
    "eugene": { name: "eugene", state: "OR" },
    "santa-cruz": { name: "santa cruz", state: "CA" },
    "somerville": { name: "somerville", state: "MA" },
    "olympia": { name: "olympia", state: "WA" },
    "portland-me": { name: "portland", state: "ME" },
    "asheville": { name: "asheville", state: "NC" },
    "burlington": { name: "burlington", state: "VT" },
    "ithaca": { name: "ithaca", state: "NY" },
  };
  for (const [slug, info] of Object.entries(cityMap)) {
    if (cityLower === info.name && stateUpper === info.state) return slug;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { streetAddress, secondaryAddress, city, state, zipCode } = await req.json();

    if (!streetAddress) {
      return new Response(
        JSON.stringify({ error: "streetAddress is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const token = await getUSPSToken();

    const params = new URLSearchParams();
    params.set("streetAddress", streetAddress);
    if (secondaryAddress) params.set("secondaryAddress", secondaryAddress);
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (zipCode) params.set("ZIPCode", zipCode);

    const uspsResp = await fetch(`${USPS_ADDRESS_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!uspsResp.ok) {
      const errText = await uspsResp.text();
      return new Response(
        JSON.stringify({ error: "USPS validation failed", detail: errText }),
        { status: 422, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const uspsData = await uspsResp.json();
    const addr = uspsData.address;

    if (!addr) {
      return new Response(
        JSON.stringify({ valid: false, error: "Address not found" }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const supportedCity = findSupportedCity(addr.ZIPCode, addr.city, addr.state);

    // Backward compat
    const isBoulder = supportedCity === "boulder";

    const normalized = `${addr.streetAddress}${addr.secondaryAddress ? " " + addr.secondaryAddress : ""}, ${addr.city}, ${addr.state} ${addr.ZIPCode}`;

    const hashInput = normalized.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, " ");
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(hashInput));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const addressHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return new Response(
      JSON.stringify({
        valid: true,
        isBoulder,
        supportedCity,
        citySlug: supportedCity,
        address: {
          streetAddress: addr.streetAddress,
          secondaryAddress: addr.secondaryAddress || "",
          city: addr.city,
          state: addr.state,
          zipCode: addr.ZIPCode,
          zipPlus4: addr.ZIPPlus4 || "",
        },
        normalized,
        addressHash,
        corrections: uspsData.corrections || [],
        additionalInfo: {
          deliveryPoint: uspsData.additionalInfo?.deliveryPoint,
          vacant: uspsData.additionalInfo?.vacant,
          business: uspsData.additionalInfo?.business,
        },
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
