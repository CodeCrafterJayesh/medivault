"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: May 18, 2024</p>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2>Introduction</h2>
              <p>
                At MediVault, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our service. Please read this privacy policy
                carefully. If you do not agree with the terms of this privacy policy, please do not access the
                application.
              </p>
            </section>

            <section className="mb-8">
              <h2>Information We Collect</h2>
              <p>We collect information that you provide directly to us when you:</p>
              <ul>
                <li>Register for an account</li>
                <li>Fill in forms on our application</li>
                <li>Upload medical records and health information</li>
                <li>Correspond with us</li>
                <li>Respond to surveys</li>
              </ul>

              <p>The types of information we may collect include:</p>
              <ul>
                <li>Personal identifiers (name, email address, phone number)</li>
                <li>Authentication information (password)</li>
                <li>Health and medical information</li>
                <li>Emergency contact information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Develop new products and services</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal
                information. However, please be aware that no method of transmission over the internet or electronic
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p>Our security measures include:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Secure data storage with Supabase</li>
                <li>Regular backups</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information. We may share your information in the following situations:
              </p>
              <ul>
                <li>With your consent, when you choose to share your health information with healthcare providers</li>
                <li>With service providers who perform services on our behalf</li>
                <li>To comply with legal obligations</li>
                <li>To protect and defend our rights and property</li>
                <li>With business partners with your consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to delete your information</li>
                <li>The right to restrict processing</li>
                <li>The right to data portability</li>
                <li>The right to object to processing</li>
              </ul>
              <p>To exercise these rights, please contact us at medivaultdigihealth@gmail.com.</p>
            </section>

            <section className="mb-8">
              <h2>International Data Transfers</h2>
              <p>
                Your information may be transferred to, and maintained on, computers located outside of your state,
                province, country, or other governmental jurisdiction where the data protection laws may differ from
                those in your jurisdiction.
              </p>
              <p>
                If you are located outside India and choose to provide information to us, please note that we transfer
                the information to India and process it there. Your consent to this Privacy Policy followed by your
                submission of such information represents your agreement to that transfer.
              </p>
            </section>

            <section className="mb-8">
              <h2>Children's Privacy</h2>
              <p>
                Our service is not intended for use by children under the age of 13. We do not knowingly collect
                personal information from children under 13. If we learn we have collected or received personal
                information from a child under 13 without verification of parental consent, we will delete that
                information.
              </p>
            </section>

            <section className="mb-8">
              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last Updated" date at the top of this page. You are
                advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
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
