import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Atomio - Read our terms and conditions.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-6">Last updated: January 2025</p>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using Atomio, you accept and agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground">
            Atomio is a free habit tracking application that allows users to create, track, and monitor
            their daily habits. The service is provided &quot;as is&quot; and is available to users who create an account
            using Google authentication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
          <p className="text-muted-foreground mb-3">By creating an account, you agree to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
          <p className="text-muted-foreground mb-3">You agree not to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Upload malicious code or content</li>
            <li>Violate the rights of others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
          <p className="text-muted-foreground">
            Atomio is open source software. The source code is available on GitHub under the project&apos;s license.
            Your habit data belongs to you, and you retain all rights to the content you create within the application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Service Availability</h2>
          <p className="text-muted-foreground">
            We strive to provide reliable service, but we do not guarantee uninterrupted availability.
            We may modify, suspend, or discontinue the service at any time without prior notice.
            We are not liable for any loss or damage resulting from service interruptions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground">
            The service is provided &quot;as is&quot; without warranties of any kind, either express or implied.
            We do not warrant that the service will meet your requirements or that it will be error-free.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, Atomio and its creators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages resulting from your use of
            or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Account Termination</h2>
          <p className="text-muted-foreground">
            You may delete your account at any time. We reserve the right to terminate or suspend accounts
            that violate these terms or for any other reason at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We may update these Terms of Service from time to time. Continued use of the service after
            changes constitutes acceptance of the new terms. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">11. Contact</h2>
          <p className="text-muted-foreground">
            For questions about these Terms of Service, please contact us through our GitHub repository
            at <a href="https://github.com/lazarspasic96/atomio-app" className="text-emerald-500 hover:text-emerald-400">github.com/lazarspasic96/atomio-app</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
