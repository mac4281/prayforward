import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Pray It Forward',
  description: 'Terms & Conditions for Pray It Forward',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-6">
            Terms & Conditions
          </h1>
          <div className="prose prose-lg max-w-none text-[#3D2817]">
            <p className="text-sm text-[#3D2817]/70 mb-6">
              Last updated: December 4, 2025
            </p>
            <p className="mb-6">
              By accessing or using the Pray It Forward website, you agree to these Terms & Conditions. If you do not agree with any part of these terms, please do not use this site.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Use of the site</h2>
            <p className="mb-6">
              You agree to use this site only for lawful purposes and in a way that does not infringe on the rights of others or restrict their use and enjoyment of the site.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Products and purchases</h2>
            <p className="mb-6">
              Our merchandise is offered through our partner Printify. Your purchase, shipping, and returns are subject to their terms and policies in addition to any terms stated here.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Intellectual property</h2>
            <p className="mb-6">
              All content on this site, including logos, graphics, and text, is owned by or licensed to Pray It Forward and may not be used without prior written permission.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Limitation of liability</h2>
            <p className="mb-6">
              This site is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for any damages arising from your use of the site.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Changes</h2>
            <p className="mb-6">
              We may update these Terms & Conditions from time to time. Continued use of the site after changes are posted constitutes your acceptance of the updated terms.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

