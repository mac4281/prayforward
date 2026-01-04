import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Pray It Forward',
  description: 'Learn about Pray It Forward and our mission to spread good through prayer',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-6">
            About Us
          </h1>
          <div className="prose prose-lg max-w-none text-[#3D2817]">
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Our Mission</h2>
            <p className="mb-6">
              Pray It Forward exists to prove the power of prayer through technology. We're building a global community of prayer warriors united by a shared mission: to demonstrate that prayer works, to support one another in times of need, and to create a ripple effect of hope and healing that reaches millions.
            </p>
            <p className="mb-6">
              Our vision is ambitious but achievable: <strong>1 million prayer warriors</strong> coming together to offer <strong>10 million prayers</strong>. We believe that by harnessing the power of technology, we can connect people across the globe, break down barriers, and show the world that prayer is not just a personal practice—it's a force for good that can transform lives and communities.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">How It Works</h2>
            <p className="mb-6">
              Users can submit prayer requests and pray for others. For every prayer you offer, you build up credits that allow you to submit your own prayer requests. This creates a cycle of giving and receiving that strengthens our community and ensures that everyone who gives also receives.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Why We Need Your Support</h2>
            <p className="mb-6">
              Building a community of 1 million prayer warriors and reaching 10 million prayers requires support in many forms. Every contribution, no matter how small, helps us grow and reach more people:
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2 ml-4">
              <li><strong>Share prayer requests</strong> - Help spread the word about those in need</li>
              <li><strong>Share the app</strong> - Invite others to join our community</li>
              <li><strong>Share prayers</strong> - Offer prayers for those who need them</li>
              <li><strong>Financial support</strong> - Help us maintain and grow our platform</li>
              <li><strong>Business partnerships</strong> - Partner with us to reach more people</li>
            </ul>
            <p className="mb-6">
              Together, we can prove the power of prayer and create a movement that changes lives.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">501(c)(3) Non-Profit</h2>
            <p className="mb-6">
              Pray It Forward is a US recognized 501(c)(3) non-profit organization. Your support helps us continue our mission and reach more people in need of prayer. All donations are tax-deductible and go directly toward building our community and platform.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Join Us</h2>
            <p className="mb-6">
              Whether you're looking to pray for others, submit a prayer request, or support our mission, we invite you to be part of this movement. Together, we can prove the power of prayer and build a community that makes a real difference in the world.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

