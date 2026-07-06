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
          <p>Averis Academy is operated by Averis Global Limited. We provide a wealth creation platform that helps Africans build online income and investment portfolios. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform at averisacademy.com.</p>
          <p>If you have questions, contact us at: <a href="mailto:Averislimited@gmail.com" className="text-[#40D457] underline">Averislimited@gmail.com</a></p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong>Account information:</strong> Your name, email address, and password when you register.</p>
          <p><strong>Payment information:</strong> Payment is processed by Korapay. We do not store card details. We receive confirmation of successful transactions.</p>
          <p><strong>Bank details:</strong> Bank name, account number, and verified account name, used solely to process your withdrawal requests.</p>
          <p><strong>Profile photo:</strong> If you upload one, it is stored on Cloudinary and displayed on your account.</p>
          <p><strong>Telegram ID:</strong> If you link your Telegram account to join our community group.</p>
          <p><strong>Usage data:</strong> Pages visited, course progress, and affiliate link activity, used to improve the platform.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Operate and maintain your account</li>
            <li>Process payments and withdrawals</li>
            <li>Track affiliate sales and credit commissions</li>
            <li>Send you account notifications and subscription reminders</li>
            <li>Add you to the Averis Academy Telegram community</li>
            <li>Improve our courses and platform</li>
          </ul>
          <p>We do not sell or rent your personal information to third parties.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share your data with the following trusted third parties only as necessary:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Korapay</strong>: payment processing</li>
            <li><strong>Resend</strong>: transactional email delivery</li>
            <li><strong>Cloudinary</strong>: profile photo storage</li>
            <li><strong>MongoDB Atlas</strong>: secure database hosting</li>
            <li><strong>Vercel</strong>: platform hosting</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes.</p>
        </Section>

        <Section title="6. Security">
          <p>We protect your data using industry-standard security measures including encrypted passwords (bcrypt), HTTPS, and secure database access controls. However, no system is 100% secure. Please use a strong, unique password for your account.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:Averislimited@gmail.com" className="text-[#40D457] underline">Averislimited@gmail.com</a> to make a request.</p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform.</p>
        </Section>
      </main>

      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-xs text-gray-400">© 2026 Averis Global Limited. <Link href="/terms-of-service" className="underline hover:text-[#122F38]">Terms of Service</Link></p>
      </footer>
    </div>
  );
}
