import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, Button, Input, Textarea } from '../../common';

interface RebuttalFormProps {
  reportId: string;
  propertyId: string;
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export function RebuttalForm({ reportId, propertyId }: RebuttalFormProps) {
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [step, setStep] = useState<'form' | 'paying' | 'submitted'>('form');
  const [error, setError] = useState('');

  const handlePayAndSubmit = async () => {
    if (!email || !body.trim()) return;
    setError('');
    setStep('paying');

    try {
      // In production, this would create a Stripe Checkout session via Edge Function
      // For now, show a placeholder flow
      if (!stripePromise) {
        setError('Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in your environment.');
        setStep('form');
        return;
      }

      // TODO: Call Supabase Edge Function to create Stripe Checkout session
      // The Edge Function would:
      // 1. Create a Stripe Checkout session ($10)
      // 2. On success webhook, insert the rebuttal into the database
      // 3. Redirect back to the property page
      
      alert(`Payment flow placeholder: $10 rebuttal for report ${reportId} on property ${propertyId}\n\nIn production, this redirects to Stripe Checkout.\nEmail: ${email}\nRebuttal: ${body}`);
      setStep('submitted');
    } catch {
      setError('Payment failed. Please try again.');
      setStep('form');
    }
  };

  if (step === 'submitted') {
    return (
      <Card variant="success">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-emerald-800">Rebuttal Submitted</h4>
          <p className="mt-2 text-sm text-emerald-700">
            Your response will appear alongside the report after payment confirmation.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200 bg-teal-50/50">
      <h4 className="mb-4 text-lg font-semibold text-text">Respond as Property Owner ($10)</h4>
      <p className="mb-4 text-sm text-text-muted">
        Property owners can respond to reports. A $10 fee helps prevent abuse. Your response will be displayed with a "Landlord Response" badge.
      </p>

      <div className="space-y-4">
        <Input
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="landlord@example.com"
          required
        />

        <Textarea
          label="Your response"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Explain the actions taken to address this issue..."
          maxLength={1000}
          required
        />
        <p className="text-xs text-text-muted">{body.length}/1000 characters</p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          onClick={handlePayAndSubmit}
          disabled={!email || !body.trim() || step === 'paying'}
          fullWidth
        >
          {step === 'paying' ? 'Processing...' : 'Pay $10 & Submit Response'}
        </Button>
      </div>
    </Card>
  );
}
