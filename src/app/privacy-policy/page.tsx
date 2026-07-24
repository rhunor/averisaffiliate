import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Averis Academy",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#122F38] mb-3">{title}</h2>
      <div className="text-[#555] text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-black text-[#122F38] mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>

        <Section title="1. Who We Are">
          <p>Averis Academy is operated by Averis Global Limited, a company registered in Nigeria. We provide a wealth creation platform that helps Africans build sustainable online income through proven digital business systems.</p>
          <p>This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform at averisacademy.com.</p>
          <p>If you have questions about this policy, contact us at: <a href="mailto:admin@averisacademy.com" className="text-[#40D457] underline">admin@averisacademy.com</a></p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following information when you use Averis Academy:</p>
          <p><strong>Account information:</strong> your full name, email address, and password when you register.</p>
          <p><strong>Payment information:</strong> payments are processed securely by Korapay. We do not store your card details. We receive only confirmation of successful transactions.</p>
          <p><strong>Bank details:</strong> your bank name, account number, and verified account name, used solely to process your withdrawal requests.</p>
          <p><strong>Profile photo:</strong> if you upload one, it is stored on Cloudinary and displayed on your account profile.</p>
          <p><strong>Telegram ID:</strong> if you link your Telegram account to join our income stream communities.</p>
          <p><strong>Usage data:</strong> pages visited, course or product progress, affiliate link activity, and login history, used to improve the platform experience.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your personal information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Create and manage your Averis Academy account</li>
            <li>Process payments and subscription renewals</li>
            <li>Track affiliate sales and credit commissions to your account wallet</li>
            <li>Process your withdrawal requests to your verified bank account</li>
            <li>Add you to the relevant Averis Academy community (Telegram or WhatsApp) for your chosen income stream</li>
            <li>Send you account notifications, subscription reminders, and platform updates</li>
            <li>Improve our income stream products, trainings, and platform features</li>
          </ul>
          <p>We do not sell, rent, or trade your personal information to any third parties for marketing purposes.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share your data with the following trusted service providers only as necessary to operate the platform:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Korapay:</strong> secure payment processing and withdrawal transfers</li>
            <li><strong>Resend:</strong> transactional email delivery (account notifications, receipts)</li>
            <li><strong>Cloudinary:</strong> profile photo storage and delivery</li>
            <li><strong>MongoDB Atlas:</strong> secure encrypted database hosting</li>
            <li><strong>Vercel:</strong> platform hosting and deployment</li>
          </ul>
          <p>All third-party providers are bound by their own privacy and security policies. We do not share your data with any other parties.</p>
        </Section>

        <Section title="5. Cookies and Tracking">
          <p>Averis Academy uses essential cookies to keep you logged into your account and maintain your session. We may also use analytics tools to understand how users interact with the platform so we can improve it.</p>
          <p>You can disable cookies in your browser settings, but doing so may affect your ability to log in or use certain platform features.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your account data for as long as your account remains active on the platform. If you request deletion of your account, we will remove your personal data within 30 days, except where we are legally or financially required to retain certain records.</p>
        </Section>

        <Section title="7. Data Security">
          <p>We protect your information using industry-standard security measures including:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Encrypted passwords using bcrypt hashing</li>
            <li>HTTPS encryption for all data transmitted to and from the platform</li>
            <li>Secure, access-controlled database hosting via MongoDB Atlas</li>
          </ul>
          <p>While we take reasonable steps to protect your data, no system is completely secure. We encourage you to use a strong, unique password for your Averis Academy account and to keep it confidential.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>As a user of Averis Academy, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing where applicable</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:admin@averisacademy.com" className="text-[#40D457] underline">admin@averisacademy.com</a>. We will respond within 14 business days.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>Averis Academy is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a user is under 18, we will terminate their account and delete their data.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time as our platform evolves. When we make significant changes, we will notify you via email or a prominent notice on the platform. The &ldquo;Last updated&rdquo; date at the top of this policy reflects the most recent revision.</p>
          <p>Continued use of Averis Academy after changes are posted constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="11. Contact Us">
          <p>For any questions, concerns, or requests related to this Privacy Policy, please contact:</p>
          <ul className="list-none space-y-1 ml-2">
            <li>Email: <a href="mailto:admin@averisacademy.com" className="text-[#40D457] underline">admin@averisacademy.com</a></li>
            <li>WhatsApp: <a href="https://wa.me/2349025644878" className="text-[#40D457] underline">+234 902 564 4878</a></li>
            <li>Platform: <a href="https://averisacademy.com" className="text-[#40D457] underline">averisacademy.com</a></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-xs text-gray-400">© 2026 Averis Global Limited. <Link href="/terms-of-service" className="underline hover:text-[#122F38]">Terms of Service</Link></p>
      </footer>
    </div>
  );
}
