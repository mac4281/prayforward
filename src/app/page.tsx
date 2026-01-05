import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - App Download Focus */}
      <main className="flex-1 bg-[#F5F5DC]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D2817] mb-6">
              Join Our Mission to Reach 1 Million Prayer Warriors
            </h1>
            <p className="text-xl md:text-2xl text-[#3D2817] mb-8 max-w-2xl mx-auto">
              Prove the power of prayer through technology. Download the app and be part of a movement working toward 10 million prayers.
            </p>
            
            {/* App Download Button */}
            <div className="flex justify-center mb-8">
              <Link
                href="https://apps.apple.com/us/app/pray-it-forward/id6757207986"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/395837460.png"
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                  className="h-14 md:h-16 w-auto object-contain"
                  unoptimized
                />
              </Link>
            </div>
            
            <p className="text-sm md:text-base text-[#3D2817]/70">
              Available on the App Store
            </p>
          </section>

          {/* Mission & Vision Section */}
          <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-[#3D2817] text-base md:text-lg leading-relaxed mb-6 text-center max-w-3xl mx-auto">
              Pray It Forward exists to prove the power of prayer through technology. We're building a global community of prayer warriors united by a shared mission: to demonstrate that prayer works, to support one another in times of need, and to create a ripple effect of hope and healing that reaches millions.
            </p>
            
            {/* Goals */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-[#F5F5DC] rounded-lg p-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#3D2817] mb-2">1M</div>
                <div className="text-lg font-semibold text-[#3D2817]">Prayer Warriors</div>
                <div className="text-sm text-[#3D2817]/70 mt-2">Our goal: Building a community of faith</div>
              </div>
              <div className="bg-[#F5F5DC] rounded-lg p-6 text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#3D2817] mb-2">10M</div>
                <div className="text-lg font-semibold text-[#3D2817]">Prayers</div>
                <div className="text-sm text-[#3D2817]/70 mt-2">Our goal: Proving the power of prayer</div>
              </div>
            </div>
          </section>

          {/* Why Support Us Section */}
          <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-6 text-center">
              Why We Need Your Support
            </h2>
            <p className="text-[#3D2817] text-base md:text-lg leading-relaxed mb-8 text-center max-w-3xl mx-auto">
              Building a community of 1 million prayer warriors and reaching 10 million prayers requires support in many forms. Every contribution helps us grow and reach more people:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-[#40E0D0]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D2817] mb-1">Share Prayer Requests</h3>
                  <p className="text-sm text-[#3D2817]/70">Help spread the word about those in need</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-[#40E0D0]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D2817] mb-1">Share the App</h3>
                  <p className="text-sm text-[#3D2817]/70">Invite others to join our community</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-[#40E0D0]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D2817] mb-1">Financial Support</h3>
                  <p className="text-sm text-[#3D2817]/70">Help us maintain and grow our platform</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-[#40E0D0]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D2817] mb-1">Business Partnerships</h3>
                  <p className="text-sm text-[#3D2817]/70">Partner with us to reach more people</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link
                href="/support"
                className="inline-block bg-[#3D2817] text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors"
              >
                Support Our Mission
              </Link>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-8 text-center">
              How It Works
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#40E0D0] rounded-full flex items-center justify-center">
                  <span className="text-[#3D2817] font-bold text-lg">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#3D2817] mb-2">Pray for Others</h3>
                  <p className="text-[#3D2817] text-base">
                    Pray for 10 or more people to earn credits for your own prayer requests
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#40E0D0] rounded-full flex items-center justify-center">
                  <span className="text-[#3D2817] font-bold text-lg">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#3D2817] mb-2">Submit Your Request</h3>
                  <p className="text-[#3D2817] text-base">
                    When you need prayer, submit your request using your earned credits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#40E0D0] rounded-full flex items-center justify-center">
                  <span className="text-[#3D2817] font-bold text-lg">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#3D2817] mb-2">Get Notified</h3>
                  <p className="text-[#3D2817] text-base">
                    Receive notifications as people pray for you and experience the power of community prayer
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="text-center bg-[#40E0D0] rounded-xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg md:text-xl text-[#3D2817] mb-8 max-w-2xl mx-auto">
              Download the app today and join our growing community of prayer warriors working together to prove the power of prayer through technology.
            </p>
            <Link
              href="https://apps.apple.com/us/app/pray-it-forward/id6757207986"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
              aria-label="Download on the App Store"
            >
              <Image
                src="/395837460.png"
                alt="Download on the App Store"
                width={200}
                height={67}
                className="h-16 md:h-20 w-auto object-contain mx-auto"
                unoptimized
              />
            </Link>
            <p className="text-sm md:text-base text-[#3D2817]/70 mt-4">
              Or <Link href="/pray" className="underline font-semibold">start praying on the web</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
