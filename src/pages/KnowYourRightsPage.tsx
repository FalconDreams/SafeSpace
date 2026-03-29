import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RightsAccordion } from '../components/features/Rights/RightsAccordion';
import { CityRightsAccordion } from '../components/features/Rights/CityRightsAccordion';
import { SuccessStories } from '../components/features/Rights/SuccessStories';
import { Card, Select } from '../components/common';
import { getCityBySlug, getSupportedCities } from '../data/cityRegistry';

export const KnowYourRightsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city');
  const [selectedCity, setSelectedCity] = useState(cityParam || '');

  const city = selectedCity ? getCityBySlug(selectedCity) : undefined;
  const cities = getSupportedCities();
  const cityOptions = [
    { value: '', label: 'Select a city...' },
    ...cities.map((c) => ({ value: c.slug, label: `${c.name}, ${c.stateCode}` })),
  ];

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelectedCity(slug);
    if (slug) {
      setSearchParams({ city: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Know Your Rights</h1>
        <p className="mt-2 text-lg text-text-muted">
          {city
            ? `Tenant protections in ${city.name}, ${city.stateCode}`
            : 'Understanding tenant protections in your city'}
        </p>
      </div>

      {/* City selector */}
      <div className="max-w-xs">
        <Select
          label="Choose your city"
          options={cityOptions}
          value={selectedCity}
          onChange={handleCityChange}
        />
      </div>

      {city ? (
        <>
          <Card className="bg-sage-50 border-sage-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-sage-900">{city.name} Tenant Protections</h3>
                <p className="mt-1 text-sage-800">
                  {city.keyLaws.map((l) => l.name).join(', ')}
                </p>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold text-ink mb-6">Your Legal Rights</h2>
            <CityRightsAccordion rights={city.rights} />
          </div>

          <Card className="bg-surface-muted">
            <h3 className="text-lg font-semibold text-ink mb-4">Need Legal Help?</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {city.emergencyContacts
                .filter((c) => c.description.toLowerCase().includes('legal'))
                .slice(0, 2)
                .map((contact) => (
                  <div key={contact.phone}>
                    <h4 className="font-medium text-ink">{contact.name}</h4>
                    <p className="text-sm text-text-muted">{contact.description}</p>
                    <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="text-sage-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          <Card className="bg-sage-50 border-sage-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-sage-900">Select a City Above</h3>
                <p className="mt-1 text-sage-800">
                  Choose your city to see the specific tenant protections that apply to you.
                </p>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold text-ink mb-6">General Tenant Rights (Boulder, CO)</h2>
            <RightsAccordion />
          </div>
        </>
      )}

      <div className="border-t border-border pt-8">
        <SuccessStories />
      </div>

      <div className="bg-bamboo-50 border border-bamboo-200 rounded-md p-4">
        <p className="text-sm text-bamboo-800">
          <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute legal advice.
          For specific legal guidance, consult with a qualified attorney.
        </p>
      </div>
    </div>
  );
};
