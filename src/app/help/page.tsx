import type { Metadata } from "next";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Help & Support - Pray It Forward',
  description: 'Get help and support for Pray It Forward. Find answers to common questions and contact information.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      
      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-6">
            Help & Support
          </h1>
          
          <div className="prose prose-lg max-w-none text-[#3D2817] space-y-8">
            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Contact Us</h2>
              <p className="mb-4">
                Need help? We're here for you! Reach out to us with any questions, concerns, or feedback.
              </p>
              <div className="bg-[#F5F5DC] rounded-lg p-6 border border-[#3D2817]/20">
                <p className="font-semibold mb-2">Email Support:</p>
                <p className="mb-4">
                  <a 
                    href="mailto:support@prayforward.org" 
                    className="text-[#40E0D0] hover:underline font-medium"
                  >
                    support@prayforward.org
                  </a>
                </p>
                <p className="text-sm text-[#3D2817]/70">
                  We typically respond within 24-48 hours.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">How do I submit a prayer request?</h3>
                  <p className="text-[#3D2817]/80">
                    To submit a prayer request, you need to earn a prayer request credit by praying for at least 10 people. 
                    Once you have a credit, go to the "Add a prayer request" page and submit your request.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">How do I earn prayer request credits?</h3>
                  <p className="text-[#3D2817]/80">
                    You earn a prayer request credit every 10 prayers you complete in a session. Keep praying for others 
                    to earn more credits!
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">Do I need to create an account?</h3>
                  <p className="text-[#3D2817]/80">
                    No, you can use the app anonymously. However, creating an account allows you to track your prayer 
                    history and manage your prayer request credits across devices.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">How do I share a prayer request?</h3>
                  <p className="text-[#3D2817]/80">
                    On any prayer request page, click the "Share" button to share the request with others via text, 
                    email, or social media.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">What happens when a prayer request reaches its target?</h3>
                  <p className="text-[#3D2817]/80">
                    When a prayer request receives the target number of prayers, it's marked as complete. The person 
                    who submitted it will know that their request has been fully prayed for.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">Can I delete my prayer request?</h3>
                  <p className="text-[#3D2817]/80">
                    Yes, you can delete your own prayer requests. Go to your account page to manage your requests.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">How do I report inappropriate content?</h3>
                  <p className="text-[#3D2817]/80">
                    If you encounter inappropriate content, please contact us immediately at{' '}
                    <a 
                      href="mailto:support@prayforward.org" 
                      className="text-[#40E0D0] hover:underline"
                    >
                      support@prayforward.org
                    </a>
                    {' '}with details about the content.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#3D2817]">Is my information private?</h3>
                  <p className="text-[#3D2817]/80">
                    Yes, we respect your privacy. You can use the app anonymously, and we don't share your personal 
                    information. See our{' '}
                    <a 
                      href="/privacy" 
                      className="text-[#40E0D0] hover:underline"
                    >
                      Privacy Policy
                    </a>
                    {' '}for more details.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Technical Support</h2>
              <p className="mb-4">
                Experiencing technical issues? Here are some things to try:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#3D2817]/80 ml-4">
                <li>Make sure you're using the latest version of the app</li>
                <li>Try closing and reopening the app</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache if using the web version</li>
                <li>Restart your device</li>
              </ul>
              <p className="mt-4">
                If problems persist, please contact us at{' '}
                <a 
                  href="mailto:support@prayforward.org" 
                  className="text-[#40E0D0] hover:underline font-medium"
                >
                  support@prayforward.org
                </a>
                {' '}with details about the issue.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mt-8 mb-4 text-[#3D2817]">Feedback & Suggestions</h2>
              <p className="mb-4">
                We love hearing from you! Your feedback helps us improve the app. Send us your suggestions, 
                feature requests, or general feedback at{' '}
                <a 
                  href="mailto:support@prayforward.org" 
                  className="text-[#40E0D0] hover:underline font-medium"
                >
                  support@prayforward.org
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

