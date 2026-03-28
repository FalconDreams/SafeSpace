import { useState, type FormEvent } from 'react';
import { Button, Input } from '../../common';

interface PropertySearchProps {
  onSearch: (address: string) => void;
  loading?: boolean;
}

export function PropertySearch({ onSearch, loading }: PropertySearchProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (address.trim()) onSearch(address.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Enter a Boulder County address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label="Property address"
          />
        </div>
        <Button type="submit" disabled={!address.trim() || loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <p className="text-sm text-text-muted">
        Search any Boulder County rental address to view reports, comments, and landlord responses.
      </p>
    </form>
  );
}
