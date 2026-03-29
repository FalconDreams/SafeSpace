import { useState, type FormEvent } from 'react';
import { Button, Input, Card } from '../../common';
import { supabase } from '../../../lib/supabase';

interface Props {
  city?: string;
  state?: string;
  zip?: string;
}

export function WaitlistForm({ city, state, zip }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const { error: insertErr } = await supabase.from('waitlist').insert({
        email: email.trim(),
        city: city || null,
        state: state || null,
        zip: zip || null,
      });
      if (insertErr) throw insertErr;
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-sage-50 border-sage-200 text-center">
        <p className="font-semibold text-sage-800">You're on the list!</p>
        <p className="mt-1 text-sm text-sage-700">
          We'll notify you when SafeSpace launches in {city ? `${city}, ${state}` : 'your area'}.
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-bamboo-50 border-bamboo-200">
      <div className="text-center space-y-3">
        <p className="font-semibold text-bamboo-900">
          SafeSpace doesn't cover {city ? `${city}, ${state}` : 'this city'} yet
        </p>
        <p className="text-sm text-bamboo-800">
          Join the waitlist and we'll let you know when we expand to your area.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end max-w-md mx-auto">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
          </div>
          <Button type="submit" disabled={submitting || !email.trim()}>
            {submitting ? 'Joining...' : 'Join Waitlist'}
          </Button>
        </form>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Card>
  );
}
