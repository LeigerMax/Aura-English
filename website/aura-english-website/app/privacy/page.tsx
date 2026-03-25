import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Aura English handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Header Spacer */}
      <div className="h-24 md:h-32 bg-slate-50 border-b border-slate-100"></div>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-500 mb-12 font-medium">Last updated: March 25, 2026</p>

        <div className="prose prose-slate prose-lg max-w-none text-slate-700 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Overview</h2>
            <p>
              Aura English is designed with privacy as a core principle. As an
              offline-first application, most of your data never leaves your
              device. We do not have user accounts, and we do not store your
              personal information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. Data Storage
            </h2>
            <p>
              All application data, including your flashcards, learning
              progress, and statistics, is stored locally on your mobile device
              using an internal database (SQLite). This data is not synchronized 
              to any cloud service controlled by Aura English.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. API Keys (Gemini AI)
            </h2>
            <p>
              To use AI-powered features, you may provide your own Google Gemini API
              key. 
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Local Storage:</strong> Your API key is stored locally on
                your device using encrypted storage (SecureStore).
              </li>
              <li>
                <strong>Direct Communication:</strong> When you use AI features, 
                your device communicates directly with Google's servers. Your API 
                key is never sent to Aura English servers or any other third party.
              </li>
              <li>
                <strong>Control:</strong> You can remove or change your API key at
                any time within the application settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Third-Party Services
            </h2>
            <p>
              Our website is hosted on <strong>Vercel</strong>, and our mobile 
              application code is hosted on <strong>GitHub</strong>. These platforms 
              may collect standard server logs (IP addresses, user agents) for 
              security and operational purposes, as described in their respective 
              privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              5. Changes to This Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date.
            </p>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact
              us via the official project repository on GitHub.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
