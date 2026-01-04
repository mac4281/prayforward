'use client';

import { useState } from 'react';

interface PaymentOption {
  label: string;
  amount: number | null; // null for "other"
}

const oneTimeAmounts: PaymentOption[] = [
  { label: '$1', amount: 1 },
  { label: '$5', amount: 5 },
  { label: '$25', amount: 25 },
  { label: '$50', amount: 50 },
  { label: '$100', amount: 100 },
  { label: 'Other', amount: null },
];

export default function SupportForm() {
  const [paymentType, setPaymentType] = useState<'subscription' | 'one-time'>('one-time');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let amount: number;

    if (paymentType === 'subscription') {
      amount = 5; // $5/month
    } else {
      if (selectedAmount === null) {
        // Custom amount
        const parsed = parseFloat(customAmount);
        if (isNaN(parsed) || parsed <= 0) {
          setError('Please enter a valid amount');
          return;
        }
        amount = parsed;
      } else {
        amount = selectedAmount;
      }
    }

    setIsProcessing(true);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType,
          amount: amount * 100, // Convert to cents
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      if (!session.url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout using the session URL
      window.location.href = session.url;
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-6">
        Support Our Mission
      </h2>
      
      {/* 501c3 Information */}
      <div className="bg-[#40E0D0]/20 border border-[#40E0D0] rounded-lg p-4 mb-6">
        <p className="text-[#3D2817] text-sm md:text-base leading-relaxed">
          <strong>Pray It Forward</strong> is a US recognized <strong>501(c)(3) non-profit organization</strong>. 
          Your donations are tax-deductible to the extent allowed by law. Thank you for supporting our mission 
          to spread good through prayer.
        </p>
      </div>

      <p className="text-[#3D2817] mb-6">
        Help us spread good through prayer. Choose a one-time donation or become a monthly supporter.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Type Selection */}
        <div>
          <label className="block text-[#3D2817] font-medium mb-3">
            Payment Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="one-time"
                checked={paymentType === 'one-time'}
                onChange={(e) => setPaymentType(e.target.value as 'one-time')}
                className="mr-2"
              />
              <span className="text-[#3D2817]">One-time</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentType"
                value="subscription"
                checked={paymentType === 'subscription'}
                onChange={(e) => setPaymentType(e.target.value as 'subscription')}
                className="mr-2"
              />
              <span className="text-[#3D2817]">Monthly ($5/month)</span>
            </label>
          </div>
        </div>

        {/* Amount Selection */}
        {paymentType === 'one-time' && (
          <div>
            <label className="block text-[#3D2817] font-medium mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {oneTimeAmounts.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(option.amount);
                    setCustomAmount('');
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                    selectedAmount === option.amount
                      ? 'bg-[#40E0D0] text-[#3D2817] border-2 border-[#3D2817]'
                      : 'bg-white text-[#3D2817] border border-[#3D2817]/20 hover:bg-[#F5F5DC]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {selectedAmount === null && (
              <div>
                <label htmlFor="customAmount" className="block text-[#3D2817] font-medium mb-2">
                  Enter Amount ($)
                </label>
                <input
                  id="customAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
                  required={selectedAmount === null}
                />
              </div>
            )}
          </div>
        )}

        {paymentType === 'subscription' && (
          <div className="bg-[#F5F5DC] p-4 rounded-lg">
            <p className="text-[#3D2817] font-medium">
              You'll be charged $5.00 per month. You can cancel anytime.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || (paymentType === 'one-time' && selectedAmount === null && !customAmount)}
          className="w-full bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : paymentType === 'subscription' ? 'Subscribe for $5/month' : `Donate $${selectedAmount === null ? customAmount || '0' : selectedAmount}`}
        </button>
      </form>
    </div>
  );
}

