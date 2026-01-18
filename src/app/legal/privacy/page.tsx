export const metadata = {
  title: 'Privacy Policy | Aegis',
  description: 'Privacy Policy for Aegis Viral Engine',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 18, 2026';

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <article className="max-w-3xl mx-auto prose prose-invert prose-slate">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: {lastUpdated}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">1. Introduction</h2>
          <p className="text-slate-300 leading-relaxed">
            Aegis Viral Engine (&ldquo;Aegis,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
            content generation and publishing platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">2. Information We Collect</h2>

          <h3 className="text-lg font-medium text-slate-300 mb-2">2.1 TikTok Account Information</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            When you connect your TikTok account, we collect:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-4">
            <li>TikTok Open ID (unique identifier)</li>
            <li>Display name and username</li>
            <li>Profile avatar URL</li>
            <li>OAuth access and refresh tokens</li>
            <li>Granted permission scopes</li>
          </ul>

          <h3 className="text-lg font-medium text-slate-300 mb-2">2.2 Content Data</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            We store content you create or generate using our platform:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-4">
            <li>Generated scripts and captions</li>
            <li>Visual assets and images</li>
            <li>Audio voiceovers</li>
            <li>Research sources and summaries</li>
            <li>Publishing preferences and settings</li>
          </ul>

          <h3 className="text-lg font-medium text-slate-300 mb-2">2.3 Usage Data</h3>
          <p className="text-slate-300 leading-relaxed">
            We may collect information about how you interact with our service, including engagement metrics
            for published content (views, likes, comments, shares) when available through TikTok&apos;s API.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">3. How We Use Your Information</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>Authenticate and maintain your TikTok connection</li>
            <li>Publish content to your TikTok account on your behalf</li>
            <li>Generate AI-powered content including scripts, visuals, and audio</li>
            <li>Display your creator information before publishing</li>
            <li>Track and display engagement analytics for your content</li>
            <li>Improve and optimize our content generation algorithms</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">4. Data Storage and Security</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Your data is stored securely using Supabase, a trusted cloud database provider. We implement
            industry-standard security measures including:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure token storage with automatic refresh</li>
            <li>Row-level security policies on database tables</li>
            <li>Regular security audits and updates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">5. Third-Party Services</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            We integrate with the following third-party services to provide our functionality:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li><strong>TikTok API</strong> - For account authentication and content publishing</li>
            <li><strong>Anthropic (Claude AI)</strong> - For script and content generation</li>
            <li><strong>Replicate (FLUX)</strong> - For visual/image generation</li>
            <li><strong>ElevenLabs</strong> - For text-to-speech voiceover generation</li>
            <li><strong>Firecrawl</strong> - For research and web content analysis</li>
            <li><strong>Supabase</strong> - For database storage and authentication</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            Each of these services has their own privacy policies. We encourage you to review them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">6. Data Sharing</h2>
          <p className="text-slate-300 leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We may share your
            information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
            <li>With TikTok to publish content you have approved</li>
            <li>With service providers who assist in operating our platform</li>
            <li>When required by law or to protect our rights</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">7. Your Rights</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            You have the following rights regarding your data:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li><strong>Access</strong> - Request a copy of your personal data</li>
            <li><strong>Correction</strong> - Request correction of inaccurate data</li>
            <li><strong>Deletion</strong> - Request deletion of your data</li>
            <li><strong>Disconnect</strong> - Revoke TikTok access at any time</li>
            <li><strong>Portability</strong> - Request your data in a portable format</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            To exercise these rights, please contact us using the information below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">8. Data Retention</h2>
          <p className="text-slate-300 leading-relaxed">
            We retain your data for as long as your account is active or as needed to provide services.
            You may request deletion of your data at any time. Upon account disconnection, we will delete
            your TikTok tokens and associated connection data within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">9. Cookies</h2>
          <p className="text-slate-300 leading-relaxed">
            We use essential cookies for OAuth state management during TikTok authentication. These cookies
            are temporary and are deleted after the authentication process completes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">10. Children&apos;s Privacy</h2>
          <p className="text-slate-300 leading-relaxed">
            Our service is not intended for users under the age of 18. We do not knowingly collect
            personal information from children under 18. If you believe we have collected such information,
            please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">11. Changes to This Policy</h2>
          <p className="text-slate-300 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">12. Contact Us</h2>
          <p className="text-slate-300 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="text-slate-300 mt-4">
            <strong>Email:</strong> privacy@aegis.app
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            &larr; Back to Home
          </a>
        </div>
      </article>
    </div>
  );
}
