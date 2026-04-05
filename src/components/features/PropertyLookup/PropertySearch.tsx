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
    <div>
      <AddressAutocomplete
        onSelect={() => setError('')}
        onSubmit={handleSubmit}
        searching={isLoading}
        error={error}
        submitLabel="Search Property"
        searchingLabel="Searching..."
        placeholder="Start typing a property address..."
      />
    </div>
  );
}
