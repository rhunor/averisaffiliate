import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Averis Academy",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#122F38] mb-3">{title}</h2>
      <div className="text-[#555] text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="22" viewBox="0 0 65 51" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
            </svg>
            <span className="font-black text-[#122F38] tracking-[0.15em] text-sm">AVERIS ACADEMY</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-[#122F38] transition-colors">← Back</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-[#122F38] mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By registering for and using Averis Academy (&ldquo;the Platform&rdquo;), you agree to be legally bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you must not use the platform.</p>
          <p>These Terms apply to all users of Averis Academy, including students and affiliates. By creating an account, you confirm that you are at least 18 years of age.</p>
        </Section>

        <Section title="2. About the Platform">
          <p>Averis Academy is a wealth creation platform operated by Averis Global Limited, a company registered in Nigeria. We provide access to multiple income stream education products delivered by verified educators with documented results in their respective fields.</p>
        </Section>

        <Section title="3. Account Registration">
          <p>To access Averis Academy, you must create an account by providing accurate and complete information. You are responsible for:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Keeping your login credentials secure and confidential</li>
            <li>All activity that takes place under your account</li>
            <li>Notifying us immediately of any unauthorised access to your account</li>
          </ul>
          <p>You may not share your account with any other person. Account sharing may result in immediate termination without refund.</p>
        </Section>

        <Section title="4. Subscriptions and Payments">
          <p>Access to Averis Academy income stream products requires payment of the applicable subscription fee as stated at the point of purchase. Subscription fees and durations may vary by product and are communicated clearly before purchase.</p>
          <p>All payments are processed securely through Korapay. By making a payment, you authorise Korapay to process your transaction in accordance with their terms.</p>
          <p>Subscription fees are non-refundable once access to the platform or any income stream has been granted. If you experience a technical issue with your payment, contact support immediately at <a href="mailto:admin@averisacademy.com" className="text-[#40D457] underline">admin@averisacademy.com</a></p>
          <p>Prices may be updated from time to time. Existing subscribers will not be affected by price changes during their active subscription period.</p>
        </Section>

        <Section title="5. Affiliate Programme">
          <p>Members of Averis Academy may participate in the affiliate programme by promoting Averis Academy products using their unique affiliate link. When a new sale is made through your link, you earn a commission that is credited to your account wallet the business day after the sale is confirmed.</p>
          <p>The following rules apply to all affiliates:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Affiliate activity must be honest, transparent, and ethical at all times</li>
            <li>You must not make false, exaggerated, or misleading claims about Averis Academy products or earning potential</li>
            <li>You must not use spam, unsolicited messages, or deceptive advertising</li>
            <li>You must not fabricate testimonials or misrepresent results</li>
            <li>You must not use paid advertising methods that violate platform advertising policies</li>
          </ul>
          <p>Violation of affiliate rules will result in immediate account termination and forfeiture of all pending commissions. Commission rates are set by Averis Academy and may be updated with reasonable notice.</p>
        </Section>

        <Section title="6. Withdrawals">
          <p>Commission earnings held in your account wallet may be withdrawn to your verified Nigerian bank account. The following conditions apply:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>A minimum withdrawal threshold applies and is stated within the platform</li>
            <li>Withdrawals are processed to the bank account details you have verified on your profile</li>
            <li>You are solely responsible for ensuring your bank account details are accurate and up to date</li>
            <li>Averis Global Limited is not liable for failed or delayed transfers resulting from incorrect bank details provided by the user</li>
          </ul>
          <p>We reserve the right to delay or withhold withdrawals pending investigation if we suspect fraudulent activity on your account.</p>
        </Section>

        <Section title="7. Prohibited Conduct">
          <p>By using Averis Academy, you agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorised access to any part of the platform or other users&apos; accounts</li>
            <li>Copy, reproduce, distribute, or resell any course content, videos, or materials from the platform</li>
            <li>Reverse engineer or attempt to extract source code from the platform</li>
            <li>Impersonate Averis Academy, Averis Global Limited, or any member of the Averis team</li>
            <li>Engage in any conduct that disrupts or harms the platform, its users, or its reputation</li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <p>All content on Averis Academy, including course videos, training materials, written content, branding, logos, and platform design is owned by Averis Global Limited or its licensed partners.</p>
          <p>Your access to this content is for personal use only. You may not copy, share, distribute, reproduce, or commercialise any platform content without prior written permission from Averis Global Limited.</p>
        </Section>

        <Section title="9. No Guarantee of Income">
          <p>Averis Academy provides education, tools, and community support to help you build online income. We do not guarantee any specific financial results.</p>
          <p>Income results shown on the platform, including testimonials, case studies, and earnings screenshots represent individual member experiences. These results are not typical and depend on each person&apos;s effort, consistency, skills, market conditions, and other factors outside our control.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by applicable law, Averis Global Limited, its directors, employees, and affiliates shall not be liable for:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of income, profits, or revenue arising from use of the platform</li>
            <li>Any errors, interruptions, or technical issues on the platform</li>
            <li>Actions taken by third-party payment processors, community platforms, or service providers</li>
          </ul>
          <p>Our total liability to you for any claim arising from your use of Averis Academy shall not exceed the amount you paid for your subscription.</p>
        </Section>

        <Section title="11. Account Suspension and Termination">
          <p>We reserve the right to suspend or permanently terminate any account that violates these Terms of Service, engages in fraudulent, deceptive, or abusive conduct, misuses the affiliate programme, or attempts to harm the platform, its users, or its reputation.</p>
          <p>In cases of serious violation, account termination will result in forfeiture of any pending commissions or wallet balance. We will provide notice where reasonably practicable, except in cases of fraud or serious misconduct.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.</p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>We may update these Terms of Service at any time. When we make material changes, we will notify you via email or a prominent notice on the platform. Your continued use of Averis Academy after changes are posted constitutes your acceptance of the updated Terms.</p>
        </Section>

        <Section title="14. Contact Us">
          <p>For questions or concerns about these Terms of Service, please contact:</p>
          <ul className="list-none space-y-1 ml-2">
            <li>Email: <a href="mailto:admin@averisacademy.com" className="text-[#40D457] underline">admin@averisacademy.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/2349025644878" className="text-[#40D457] underline">+234 902 564 4878</a></li>
            <li>Platform: <a href="https://averisacademy.com" className="text-[#40D457] underline">averisacademy.com</a></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-xs text-gray-400">© 2026 Averis Global Limited. <Link href="/privacy-policy" className="underline hover:text-[#122F38]">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}
