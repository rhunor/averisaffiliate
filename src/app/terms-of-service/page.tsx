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
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By registering for and using Averis Academy, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms apply to all users including students and affiliates.</p>
        </Section>

        <Section title="2. The Platform">
          <p>Averis Academy is a two-phase wealth creation platform. Phase 1 provides digital marketing and affiliate income training. Phase 2 (Averis Wealth Club) provides investment education. Access is granted upon payment of the subscription fee and is valid for 12 months from activation.</p>
        </Section>

        <Section title="3. Subscription & Payments">
          <p>The current subscription fee is ₦35,000 for 12 months of access. Renewal is ₦30,000 for another 12 months. Prices may change with reasonable notice. All payments are processed securely through Korapay.</p>
          <p>Subscriptions are non-refundable once access has been granted. If you experience a technical issue with payment, contact support immediately at <a href="mailto:Averislimited@gmail.com" className="text-[#40D457] underline">Averislimited@gmail.com</a>.</p>
        </Section>

        <Section title="4. Affiliate Programme">
          <p>Members may participate in the Averis Academy affiliate programme by sharing their unique affiliate link. When someone subscribes through your link, you earn a commission that is credited to your account wallet the day after the sale is confirmed.</p>
          <p>Commission rates and amounts are set by Averis Global Limited and may be updated with notice. Commissions are paid out upon withdrawal request, subject to the minimum withdrawal threshold.</p>
          <p>Affiliate activity must be honest and ethical. Spamming, misleading advertising, fake testimonials, or any form of fraud will result in immediate account termination and forfeiture of pending commissions.</p>
        </Section>

        <Section title="5. Withdrawals">
          <p>Withdrawals are processed to your verified Nigerian bank account via Korapay. A minimum withdrawal amount applies. You are responsible for ensuring your bank details are accurate. Averis Academy is not liable for failed transfers due to incorrect bank details provided by the user.</p>
        </Section>

        <Section title="6. Account Responsibilities">
          <p>You are responsible for keeping your login credentials secure. Do not share your account with others. You are responsible for all activity that occurs under your account.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>All course content, videos, materials, and branding on Averis Academy are owned by Averis Global Limited. You may not copy, redistribute, or resell any course content. Access is for personal use only.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>Averis Academy provides educational content and tools. We do not guarantee specific financial results. Income claims shared by members represent their individual experience and are not typical or guaranteed. Your results depend on your effort, skills, and market conditions.</p>
          <p>To the maximum extent permitted by law, Averis Global Limited is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        </Section>

        <Section title="9. Changes to Terms">
          <p>We may update these Terms of Service at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes via email.</p>
        </Section>

        <Section title="10. Contact">
          <p>For questions about these terms, contact us at: <a href="mailto:Averislimited@gmail.com" className="text-[#40D457] underline">Averislimited@gmail.com</a> or via WhatsApp: <a href="https://wa.me/2348085300040" className="text-[#40D457] underline">+234 808 530 0040</a></p>
        </Section>
      </main>

      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-xs text-gray-400">© 2026 Averis Global Limited. <Link href="/privacy-policy" className="underline hover:text-[#122F38]">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}
