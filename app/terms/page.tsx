"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-2">
                <MediVaultLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">MediVault</span>
              </div>
            </Link>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-3xl py-12 px-4 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: May 18, 2024</p>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the MediVault service, you agree to be bound by these Terms of Service. If you
                disagree with any part of the terms, you may not access the service.
              </p>
            </section>

            <section className="mb-8">
              <h2>2. Description of Service</h2>
              <p>
                MediVault provides a platform for users to store, manage, and share their personal health information.
                The service includes features such as medical history storage, appointment management, medication
                reminders, and secure sharing of health records.
              </p>
            </section>

            <section className="mb-8">
              <h2>3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. You
                are responsible for safeguarding the password and for all activities that occur under your account. You
                agree to notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                You may not use as a username the name of another person or entity that is not lawfully available for
                use, or a name or trademark that is subject to any rights of another person or entity without
                appropriate authorization.
              </p>
            </section>

            <section className="mb-8">
              <h2>4. User Content</h2>
              <p>
                Our service allows you to post, link, store, share and otherwise make available certain information,
                text, graphics, or other material ("Content"). You are responsible for the Content that you post on or
                through the service, including its legality, reliability, and appropriateness.
              </p>
              <p>By posting Content on or through the service, you represent and warrant that:</p>
              <ul>
                <li>
                  The Content is yours (you own it) or you have the right to use it and grant us the rights and license
                  as provided in these Terms.
                </li>
                <li>
                  The posting of your Content on or through the service does not violate the privacy rights, publicity
                  rights, copyrights, contract rights or any other rights of any person.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>5. Intellectual Property</h2>
              <p>
                The service and its original content (excluding Content provided by users), features, and functionality
                are and will remain the exclusive property of MediVault and its licensors. The service is protected by
                copyright, trademark, and other laws of both India and foreign countries. Our trademarks and trade dress
                may not be used in connection with any product or service without the prior written consent of
                MediVault.
              </p>
            </section>

            <section className="mb-8">
              <h2>6. Prohibited Uses</h2>
              <p>
                You may use the service only for lawful purposes and in accordance with these Terms. You agree not to
                use the service:
              </p>
              <ul>
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                <li>
                  To transmit, or procure the sending of, any advertising or promotional material, including any "junk
                  mail", "chain letter," "spam," or any other similar solicitation.
                </li>
                <li>
                  To impersonate or attempt to impersonate MediVault, a MediVault employee, another user, or any other
                  person or entity.
                </li>
                <li>
                  In any way that infringes upon the rights of others, or in any way is illegal, threatening,
                  fraudulent, or harmful.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>7. Limitation of Liability</h2>
              <p>
                In no event shall MediVault, nor its directors, employees, partners, agents, suppliers, or affiliates,
                be liable for any indirect, incidental, special, consequential or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use the service;</li>
                <li>Any conduct or content of any third party on the service;</li>
                <li>Any content obtained from the service; and</li>
                <li>Unauthorized access, use or alteration of your transmissions or content.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>8. Disclaimer</h2>
              <p>
                Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE"
                basis. The service is provided without warranties of any kind, whether express or implied, including,
                but not limited to, implied warranties of merchantability, fitness for a particular purpose,
                non-infringement or course of performance.
              </p>
              <p>MediVault does not warrant that:</p>
              <ul>
                <li>
                  The service will function uninterrupted, secure or available at any particular time or location;
                </li>
                <li>Any errors or defects will be corrected;</li>
                <li>The service is free of viruses or other harmful components; or</li>
                <li>The results of using the service will meet your requirements.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of India, without regard to its
                conflict of law provisions.
              </p>
              <p>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those
                rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining
                provisions of these Terms will remain in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                revision is material we will try to provide at least 30 days' notice prior to any new terms taking
                effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our service after those revisions become effective, you agree to be bound
                by the revised terms. If you do not agree to the new terms, please stop using the service.
              </p>
            </section>

            <section>
              <h2>11. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p>Email: medivaultdigihealth@gmail.com</p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container text-center">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              Return to Home
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} MediVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
