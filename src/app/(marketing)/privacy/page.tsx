import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Atomio - Learn how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: January 2025</p>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Atomio. We respect your privacy and are committed to protecting your personal data.
            This privacy policy explains how we collect, use, and safeguard your information when you use our habit tracking application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
          <p className="text-muted-foreground mb-3">We collect the following types of information:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-white">Account Information:</strong> When you sign in with Google, we receive your email address and profile name.</li>
            <li><strong className="text-white">Habit Data:</strong> The habits you create, track, and complete within the application.</li>
            <li><strong className="text-white">Usage Data:</strong> Basic analytics about how you interact with the app to improve our services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-3">We use your information to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Provide and maintain our habit tracking service</li>
            <li>Authenticate your account and keep it secure</li>
            <li>Sync your habit data across devices</li>
            <li>Improve and optimize our application</li>
            <li>Communicate with you about service updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
          <p className="text-muted-foreground">
            Your data is stored securely using industry-standard encryption. We use Supabase for authentication
            and database services, which employs robust security measures to protect your information.
            We do not sell, trade, or rent your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
          <p className="text-muted-foreground mb-3">We use the following third-party services:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong className="text-white">Google OAuth:</strong> For secure authentication</li>
            <li><strong className="text-white">Supabase:</strong> For database and authentication services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
          <p className="text-muted-foreground mb-3">You have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of your data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your habit data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain your data for as long as your account is active. If you delete your account,
            we will remove your personal data within 30 days, except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this privacy policy from time to time. We will notify you of any changes by
            posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us through our GitHub repository
            at <a href="https://github.com/lazarspasic96/atomio-app" className="text-emerald-500 hover:text-emerald-400">github.com/lazarspasic96/atomio-app</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
