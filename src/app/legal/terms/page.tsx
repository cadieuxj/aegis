export const metadata = {
  title: 'Terms of Service | Aegis',
  description: 'Terms of Service for Aegis Viral Engine',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'January 18, 2026';

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <article className="max-w-3xl mx-auto prose prose-invert prose-slate">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: {lastUpdated}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-300 leading-relaxed">
            By accessing or using Aegis Viral Engine (&ldquo;Aegis,&rdquo; &ldquo;the Service,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
            you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">2. Description of Service</h2>
          <p className="text-slate-300 leading-relaxed">
            Aegis is a content generation and publishing platform designed to create and distribute
            educational content about ethical AI and humanitarian technology. Our Service includes:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
            <li>AI-powered script and content generation</li>
            <li>Visual asset creation using generative AI</li>
            <li>Text-to-speech voiceover generation</li>
            <li>Research aggregation and summarization</li>
            <li>TikTok account integration and content publishing</li>
            <li>Analytics and engagement tracking</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">3. Eligibility</h2>
          <p className="text-slate-300 leading-relaxed">
            You must be at least 18 years old to use this Service. By using Aegis, you represent and warrant
            that you meet this age requirement and have the legal capacity to enter into these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">4. Account and TikTok Integration</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            To use certain features of our Service, you must connect your TikTok account through OAuth authentication.
            By connecting your account, you:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>Grant us permission to access your TikTok account information</li>
            <li>Grant us permission to publish content on your behalf</li>
            <li>Agree to comply with TikTok&apos;s Terms of Service and Community Guidelines</li>
            <li>Accept responsibility for all content published through our Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">5. User Responsibilities</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            When using our Service, you agree to:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>Provide accurate information when connecting accounts</li>
            <li>Review all content before approving it for publication</li>
            <li>Ensure published content complies with applicable laws and platform policies</li>
            <li>Not use the Service for spam, harassment, or malicious purposes</li>
            <li>Not attempt to circumvent security measures or access restrictions</li>
            <li>Not use the Service to generate or distribute misinformation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">6. Content Ownership and Rights</h2>

          <h3 className="text-lg font-medium text-slate-300 mb-2">6.1 Your Content</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            You retain ownership of any original content you provide to our Service. By using our Service
            to generate and publish content, you grant us a non-exclusive license to process, store, and
            transmit that content for the purpose of providing our Service.
          </p>

          <h3 className="text-lg font-medium text-slate-300 mb-2">6.2 Generated Content</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Content generated through our AI systems (scripts, visuals, audio) is created using third-party
            AI services. Usage rights for AI-generated content are subject to the terms of those services
            (Anthropic, Replicate, ElevenLabs). You are responsible for ensuring your use of generated
            content complies with all applicable terms.
          </p>

          <h3 className="text-lg font-medium text-slate-300 mb-2">6.3 Research Sources</h3>
          <p className="text-slate-300 leading-relaxed">
            Our Service aggregates information from public research sources. We do not claim ownership of
            third-party research content. Always cite original sources appropriately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">7. Acceptable Use Policy</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            You may NOT use our Service to:
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>Create or distribute content that is illegal, harmful, threatening, abusive, or defamatory</li>
            <li>Infringe on intellectual property rights of others</li>
            <li>Impersonate any person or entity</li>
            <li>Spread misinformation or disinformation</li>
            <li>Engage in spam or unsolicited advertising</li>
            <li>Harvest data or scrape content from other platforms</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Attempt to gain unauthorized access to any systems</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">8. Third-Party Services</h2>
          <p className="text-slate-300 leading-relaxed">
            Our Service integrates with third-party services including TikTok, Anthropic, Replicate,
            ElevenLabs, Firecrawl, and Supabase. Your use of these integrations is subject to their
            respective terms of service. We are not responsible for the practices or policies of
            third-party services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">9. Disclaimers</h2>

          <h3 className="text-lg font-medium text-slate-300 mb-2">9.1 Service Availability</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind.
            We do not guarantee uninterrupted or error-free service.
          </p>

          <h3 className="text-lg font-medium text-slate-300 mb-2">9.2 AI-Generated Content</h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            AI-generated content may contain errors, inaccuracies, or biases. You are responsible for
            reviewing and verifying all content before publication. We do not guarantee the accuracy,
            completeness, or suitability of generated content.
          </p>

          <h3 className="text-lg font-medium text-slate-300 mb-2">9.3 Publishing Results</h3>
          <p className="text-slate-300 leading-relaxed">
            We do not guarantee any specific results from publishing content, including views, engagement,
            or follower growth on TikTok or any other platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">10. Limitation of Liability</h2>
          <p className="text-slate-300 leading-relaxed">
            To the maximum extent permitted by law, Aegis and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, including but not limited to
            loss of profits, data, or goodwill, arising from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">11. Indemnification</h2>
          <p className="text-slate-300 leading-relaxed">
            You agree to indemnify and hold harmless Aegis, its operators, and affiliates from any claims,
            damages, losses, or expenses arising from your use of the Service, violation of these Terms,
            or infringement of any rights of third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">12. Termination</h2>
          <p className="text-slate-300 leading-relaxed">
            We reserve the right to suspend or terminate your access to the Service at any time, with or
            without cause, and with or without notice. You may disconnect your TikTok account and stop
            using the Service at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">13. Changes to Terms</h2>
          <p className="text-slate-300 leading-relaxed">
            We may update these Terms from time to time. Continued use of the Service after changes
            constitutes acceptance of the updated Terms. We will make reasonable efforts to notify users
            of material changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">14. Governing Law</h2>
          <p className="text-slate-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws, without
            regard to conflict of law principles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">15. Contact Information</h2>
          <p className="text-slate-300 leading-relaxed">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-slate-300 mt-4">
            <strong>Email:</strong> legal@aegis.app
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
