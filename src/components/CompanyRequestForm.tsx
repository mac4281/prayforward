'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnonymousUser } from '@/lib/auth';

export default function CompanyRequestForm() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !contactName.trim() || !email.trim() || !phone.trim() || !url.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Authenticate user
      await getAnonymousUser();

      // Add company request to Firestore
      await addDoc(collection(db!, 'companyRequests'), {
        date: serverTimestamp(),
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        url: url.trim(),
      });

      setSuccess(true);
      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setUrl('');

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting company request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-6">
        Add Your Company
      </h2>
      <p className="text-[#3D2817] mb-6">
        Submit your company to be featured as a community partner in our app.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block text-[#3D2817] font-medium mb-2">
            Company Name *
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
            className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="contactName" className="block text-[#3D2817] font-medium mb-2">
            Contact Name *
          </label>
          <input
            id="contactName"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Enter contact name"
            className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-[#3D2817] font-medium mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
            className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-[#3D2817] font-medium mb-2">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-[#3D2817] font-medium mb-2">
            Company URL *
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
            disabled={isSubmitting}
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Thank you! Your company request has been submitted. We'll review it and get back to you soon.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

