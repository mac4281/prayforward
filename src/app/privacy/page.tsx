import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Pray It Forward',
  description: 'Privacy Policy for Pray It Forward',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-6">
            Privacy Policy
          </h1>
          <div className="prose prose-lg max-w-none text-[#3D2817]">
            <p className="text-sm text-[#3D2817]/70 mb-6">
              Last updated: December 4, 2025
            </p>
            <p className="mb-6">
              Pray It Forward ("we", "our", or "us") respects your privacy. This page explains what information we may collect when you interact with our website and how we use it.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Information we collect</h2>
            <p className="mb-6">
              We may collect basic technical information such as your IP address, browser type, and pages visited for analytics and security purposes.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Third‑party services</h2>
            <p className="mb-6">
              Our merchandise store is powered by Printify. When you click "Support Our Mission" and make a purchase on their site, your order information is handled according to Printify's own privacy policy, which may differ from ours. We do not store your full payment details.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Cookies</h2>
            <p className="mb-6">
              Our site and third‑party services may use cookies or similar technologies to remember your preferences and understand how the site is used.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Contact</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us through the information provided on our main site.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

