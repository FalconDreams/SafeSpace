import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/common';
import { getSupportedCities } from '../data/cityRegistry';
import { validateAddress } from '../lib/usps';
import { WaitlistForm } from '../components/features/Waitlist/WaitlistForm';

// Simple US SVG map with city dots
function CityMap() {
  const cities = getSupportedCities();
  const mapBounds = { minLng: -125, maxLng: -66, minLat: 24, maxLat: 50 };
  const svgW = 960;
  const svgH = 500;

  function project(lng: number, lat: number): [number, number] {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * svgW;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * svgH;
    return [x, y];
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" role="img" aria-label="Map of SafeSpace cities">
        <rect x="0" y="0" width={svgW} height={svgH} fill="transparent" />
        {/* Simplified US outline */}
        <path
          d="M80,180 L120,100 L200,80 L300,70 L400,60 L500,50 L600,60 L700,80 L780,100 L850,130 L880,200 L870,280 L850,340 L800,380 L750,400 L680,420 L600,430 L500,440 L400,430 L300,420 L200,400 L150,350 L100,280 L80,220Z"
          fill="none"
          stroke="var(--color-bamboo-200)"
          strokeWidth="2"
          opacity="0.5"
        />

        {cities.map((city) => {
          const [cx, cy] = project(city.coordinates[0], city.coordinates[1]);
          return (
            <Link key={city.slug} to={`/city/${city.slug}`}>
              <g className="group cursor-pointer">
                <circle cx={cx} cy={cy} r="12" fill="var(--color-sage-400)" opacity="0" className="group-hover:animate-ping group-hover:opacity-20" />
                <circle cx={cx} cy={cy} r="6" fill="var(--color-sage-600)" className="transition-all duration-200" stroke="white" strokeWidth="2" />
                <text
                  x={cx}
                  y={cy - 14}
                  textAnchor="middle"
                  className="text-xs fill-ink opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}
                >
                  {city.name} →
                </text>
              </g>
            </Link>
          );
        })}
      </svg>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const cities = getSupportedCities();

  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [unsupportedCity, setUnsupportedCity] = useState<{ city: string; state: string; zip: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    setSearchError('');
    setUnsupportedCity(null);

    try {
      const result = await validateAddress(address.trim());
      if (!result.valid) {
        setSearchError('Address not found. Please enter a valid street address.');
        return;
      }
      if (result.citySlug) {
        navigate(`/city/${result.citySlug}`);
      } else {
        setUnsupportedCity({
          city: result.address.city,
          state: result.address.state,
          zip: result.address.zipCode,
        });
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Unable to validate address.');
    } finally {
      setSearching(false);
    }
  };

  const features = [
    { title: 'Emergency Health Guide', description: 'Get immediate guidance for health emergencies with legally mandated response deadlines.', link: '/emergency-guide', icon: '\u{1F6A8}', urgent: true },
    { title: 'Property Lookup', description: 'Research property health history and read community experiences.', link: '/property-lookup', icon: '\u{1F50D}' },
    { title: 'Report Health Issues', description: 'Submit health violations with photo evidence and anonymous options.', link: '/report', icon: '\u{1F4CB}' },
    { title: 'Track Landlord Response', description: 'Monitor compliance with legal deadlines and document responses.', link: '/tracker', icon: '\u{23F1}\uFE0F' },
    { title: 'Know Your Rights', description: 'Learn about tenant health and safety protections in your city.', link: '/know-your-rights', icon: '⚖️' },
    { title: 'Legal Notice Generator', description: 'Generate professional legal notices citing your local tenant protection laws.', link: '/legal-notice', icon: '📄' },
    { title: 'Rate Your Rental Experience', description: 'Rate your landlord across 7 categories and help future tenants.', link: '/review', icon: '⭐' },
  ];

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="text-center pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Know your rights. Report violations.
          <span className="text-sage-600"> Hold landlords accountable.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted leading-relaxed">
          SafeSpace helps renters in {cities.length} cities understand their rights, document violations, and take action.
        </p>
      </section>

      {/* Interactive Map */}
      <section>
        <CityMap />
      </section>

      {/* Address Search */}
      <section className="mx-auto max-w-xl">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Enter your address to get started"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setSearchError(''); setUnsupportedCity(null); }}
                aria-label="Street address"
              />
            </div>
            <Button type="submit" disabled={!address.trim() || searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {searchError && (
            <p className="text-sm text-danger">{searchError}</p>
          )}
        </form>
        {unsupportedCity && (
          <div className="mt-4">
            <WaitlistForm city={unsupportedCity.city} state={unsupportedCity.state} zip={unsupportedCity.zip} />
          </div>
        )}
      </section>

      {/* City Cards Grid */}
      <section>
        <h2 className="text-2xl font-bold text-ink text-center mb-6">Supported Cities</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link key={city.slug} to={`/city/${city.slug}`}>
              <Card hover className="h-full">
                <h3 className="text-lg font-semibold text-ink">{city.name}, {city.stateCode}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {city.renterPercent}% renters · {city.population.toLocaleString()} pop.
                </p>
                <p className="mt-2 text-sm text-sage-700">
                  {city.keyLaws[0]?.name}
                </p>
                <p className="mt-2 text-xs font-medium text-sage-600">Explore →</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold text-ink text-center mb-6">What SafeSpace Does</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.link} to={feature.link}>
              <Card hover className="h-full">
                <div className="mb-3 text-2xl">{feature.icon}</div>
                <h3 className={`text-lg font-semibold ${feature.urgent ? 'text-danger' : 'text-ink'}`}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="rounded-lg bg-sage-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Facing a Health Emergency?</h2>
        <p className="mt-2 text-sage-100">
          Some issues require landlord response within 24 hours by law.
        </p>
        <Link to="/emergency-guide">
          <Button variant="secondary" size="lg" className="mt-5 border-white/30 bg-white/10 text-white hover:bg-white/20">
            Get Emergency Guidance Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
