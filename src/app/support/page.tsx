'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CompanyRequestForm from '@/components/CompanyRequestForm';
import SupportForm from '@/components/SupportForm';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';

function SupportPageContent() {
  const [activeTab, setActiveTab] = useState<'company' | 'support'>('support');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setShowSuccessModal(true);
    } else if (canceled === 'true') {
      console.log('Payment was canceled');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      
      <main className="flex-1 px-4 md:px-6 py-8 max-w-xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md border border-[#3D2817]/10 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#3D2817]/10">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'company'
                  ? 'bg-[#40E0D0] text-[#3D2817] border-b-2 border-[#3D2817]'
                  : 'text-[#3D2817] hover:bg-[#F5F5DC]'
              }`}
            >
              Add Your Company
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'support'
                  ? 'bg-[#40E0D0] text-[#3D2817] border-b-2 border-[#3D2817]'
                  : 'text-[#3D2817] hover:bg-[#F5F5DC]'
              }`}
            >
              Support Our Mission
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'company' ? (
              <CompanyRequestForm />
            ) : (
              <SupportForm />
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <PaymentSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-xl mx-auto w-full flex items-center justify-center">
          <p className="text-[#3D2817]">Loading...</p>
        </main>
      </div>
    }>
      <SupportPageContent />
    </Suspense>
  );
}

