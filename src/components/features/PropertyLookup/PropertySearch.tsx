import { useState } from 'react';
import { validateAddress, type AddressValidationResult } from '../../../lib/addressValidation';
import { AddressAutocomplete } from '../AddressAutocomplete';

interface PropertySearchProps {
  onSearch: (result: AddressValidationResult) => void;
  loading?: boolean;
}

export function PropertySearch({ onSearch, loading }: PropertySearchProps) {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (inputAddress: string) => {
    setError('');
    setValidating(true);

    try {
      const result = await validateAddress(inputAddress);

      if (!result.valid) {
        setError('Address not found. Please check the street address and try again.');
        return;
      }

      onSearch(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to validate address. Please try again.'
      );
    } finally {
      setValidating(false);
    }
  };

  const isLoading = loading || validating;

  return (
    <div className="space-y-4">
      <AddressAutocomplete
        onSelect={() => setError('')}
        onSubmit={handleSubmit}
        searching={isLoading}
        error={error}
        submitLabel="Search Property"
        searchingLabel="Searching..."
        placeholder="Start typing a property address..."
      />
      <p className="text-sm text-text-muted">
        Enter any U.S. street address. We use the same Google-powered suggestions and validation as the homepage.
      </p>
    </div>
  );
}
