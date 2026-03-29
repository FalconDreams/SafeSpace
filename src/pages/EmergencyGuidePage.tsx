import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DecisionTree } from '../components/features/EmergencyGuide/DecisionTree';
import { EmergencyContacts } from '../components/features/EmergencyGuide/EmergencyContacts';
import { CityEmergencyContacts } from '../components/features/EmergencyGuide/CityEmergencyContacts';
import { Card, Select } from '../components/common';
import { getCityBySlug, getSupportedCities } from '../data/cityRegistry';

export function EmergencyGuidePage() {
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
        <h1 className="text-3xl font-bold text-ink">Emergency Health Guide</h1>
        <p className="mt-2 text-lg text-text-muted">
          {city
            ? `Answer a few questions to determine if your issue requires emergency response under ${city.name} law`
            : 'Answer a few questions to determine if your issue requires emergency response'}
        </p>
      </div>

      {/* City selector */}
      <div className="max-w-xs">
        <Select
          label="Your city"
          options={cityOptions}
          value={selectedCity}
          onChange={handleCityChange}
        />
      </div>

      <div className="rounded-md border border-red-200 bg-danger-bg p-4">
        <p className="text-sm font-medium text-danger">
          If you are in immediate danger, call 911 immediately
        </p>
      </div>

      {/* City-specific deadlines */}
      {city && (
        <Card className="bg-sage-50 border-sage-200">
          <h3 className="font-semibold text-sage-900 mb-2">{city.name} Response Deadlines</h3>
          <ul className="space-y-1 text-sm text-sage-800">
            <li><strong>Emergency:</strong> {city.deadlines.emergency.label}</li>
            <li><strong>Urgent:</strong> {city.deadlines.urgent.label}</li>
            <li><strong>Standard:</strong> {city.deadlines.standard.label}</li>
          </ul>
        </Card>
      )}

      <DecisionTree />

      <div className="mt-12 border-t border-border pt-8">
        {city ? (
          <CityEmergencyContacts contacts={city.emergencyContacts} />
        ) : (
          <EmergencyContacts />
        )}
      </div>
    </div>
  );
}
