"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft, Lock, Database, Eye, Server, CheckCircle } from "lucide-react"

export default function SecurityPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Security at MediVault</h1>
            <p className="text-xl text-muted-foreground">How we protect your health information</p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Security Commitment</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                At MediVault, security isn't just a feature—it's the foundation of everything we build. We understand
                that your health information is among your most sensitive personal data, and we take our responsibility
                to protect it extremely seriously.
              </p>
              <p className="text-lg">
                Our security approach follows industry best practices and incorporates multiple layers of protection to
                ensure your data remains private, secure, and available only to those you explicitly authorize.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Security Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Database className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-xl font-semibold">Data Encryption</h3>
                </div>
                <p className="text-muted-foreground">
                  All data in MediVault is encrypted both in transit and at rest using industry-standard encryption
                  protocols. This ensures that your information remains secure as it travels between your device and our
                  servers, and while it's stored in our database.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-xl font-semibold">Authentication</h3>
                </div>
                <p className="text-muted-foreground">
                  We implement robust authentication mechanisms, including strong password requirements and multi-factor
                  authentication options. Our system is designed to prevent unauthorized access attempts and protect
                  against common attack vectors.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Eye className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-xl font-semibold">Access Controls</h3>
                </div>
                <p className="text-muted-foreground">
                  MediVault employs strict access controls to ensure that only authorized individuals can access your
                  health information. You have complete control over who can view your data, with detailed permission
                  settings and the ability to revoke access at any time.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Server className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-xl font-semibold">Infrastructure Security</h3>
                </div>
                <p className="text-muted-foreground">
                  Our application is built on Supabase, which provides enterprise-grade security features. The
                  infrastructure includes regular security updates, network isolation, and continuous monitoring for
                  potential threats.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Security Practices</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Regular Security Audits</h3>
                  <p className="text-muted-foreground">
                    We conduct regular security audits and vulnerability assessments to identify and address potential
                    security issues before they can be exploited.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Secure Development Lifecycle</h3>
                  <p className="text-muted-foreground">
                    Security is integrated into every stage of our development process. We follow secure coding
                    practices and conduct code reviews to ensure that security vulnerabilities are identified and
                    addressed early.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Incident Response Plan</h3>
                  <p className="text-muted-foreground">
                    We have a comprehensive incident response plan in place to quickly address any security incidents.
                    This includes procedures for identifying, containing, and remediating security breaches, as well as
                    notifying affected users when necessary.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Employee Security Training</h3>
                  <p className="text-muted-foreground">
                    All MediVault team members receive regular security training to ensure they understand their role in
                    protecting user data and can identify potential security threats.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Supabase Security</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                MediVault is built on Supabase, a secure and scalable backend-as-a-service platform. Supabase provides
                several security features that help us protect your data:
              </p>
              <ul>
                <li>Row-level security policies that enforce access controls at the database level</li>
                <li>PostgreSQL's robust security features, including encryption and secure authentication</li>
                <li>Automated backups to prevent data loss</li>
                <li>Secure API endpoints with rate limiting to prevent abuse</li>
                <li>Continuous security monitoring and updates</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Your Role in Security</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                While we take extensive measures to protect your data, security is a shared responsibility. Here are
                some steps you can take to help keep your MediVault account secure:
              </p>
              <ul>
                <li>Use a strong, unique password for your MediVault account</li>
                <li>Enable multi-factor authentication if available</li>
                <li>Be cautious about sharing access to your health information</li>
                <li>Keep your devices and browsers updated with the latest security patches</li>
                <li>Log out of your account when using shared or public devices</li>
                <li>Regularly review your account activity for any unauthorized access</li>
              </ul>
              <p className="text-lg mt-6">
                If you have any questions about our security practices or notice any suspicious activity related to your
                account, please contact us immediately at medivaultdigihealth@gmail.com.
              </p>
            </div>
          </section>
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
