"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft, CheckCircle, Shield, Lock, FileText, Users, AlertTriangle } from "lucide-react"

export default function HipaaPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">HIPAA Compliance</h1>
            <p className="text-xl text-muted-foreground">How MediVault protects your health information</p>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2>Understanding HIPAA</h2>
              <p>
                The Health Insurance Portability and Accountability Act (HIPAA) is a US federal law enacted in 1996 that
                sets standards for the protection of sensitive patient health information. HIPAA requires appropriate
                safeguards to protect the privacy of personal health information and sets limits and conditions on the
                uses and disclosures of such information without patient authorization.
              </p>
            </section>

            <section className="mb-8">
              <h2>MediVault's Commitment to HIPAA Compliance</h2>
              <p>
                At MediVault, we understand the importance of protecting your health information. While we are not a
                covered entity under HIPAA, we voluntarily adhere to HIPAA standards and best practices to ensure the
                highest level of protection for your health data.
              </p>
              <p>
                Our platform is designed with privacy and security at its core, implementing technical, physical, and
                administrative safeguards that align with HIPAA requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2>Key HIPAA-Aligned Features</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Data Encryption</h3>
                    <p className="text-muted-foreground">
                      All health information stored in MediVault is encrypted both in transit and at rest using
                      industry-standard encryption protocols. This ensures that your data remains secure and unreadable
                      to unauthorized parties.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Lock className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Access Controls</h3>
                    <p className="text-muted-foreground">
                      We implement strict access controls to ensure that only authorized individuals can access your
                      health information. This includes role-based access, multi-factor authentication, and detailed
                      access logs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Audit Trails</h3>
                    <p className="text-muted-foreground">
                      MediVault maintains comprehensive audit trails that record all access to and actions taken with
                      your health information. This allows us to monitor for unauthorized access and provide
                      accountability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Controlled Information Sharing</h3>
                    <p className="text-muted-foreground">
                      Our platform gives you complete control over who can access your health information. You can grant
                      and revoke access permissions at any time, ensuring that your data is only shared with those you
                      explicitly authorize.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Breach Notification</h3>
                    <p className="text-muted-foreground">
                      In the unlikely event of a data breach, we have procedures in place to promptly notify affected
                      users and take appropriate steps to mitigate any potential harm.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2>Our Security Practices</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Regular Security Assessments</h3>
                    <p className="text-muted-foreground">
                      We conduct regular security assessments and vulnerability scans to identify and address potential
                      security risks.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Employee Training</h3>
                    <p className="text-muted-foreground">
                      All MediVault team members receive training on privacy and security best practices to ensure they
                      understand their responsibilities in protecting user data.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Secure Development Practices</h3>
                    <p className="text-muted-foreground">
                      We follow secure development practices to ensure that security is built into our platform from the
                      ground up.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Data Minimization</h3>
                    <p className="text-muted-foreground">
                      We collect only the information necessary to provide our services, reducing the risk of
                      unnecessary data exposure.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Business Associate Agreements</h3>
                    <p className="text-muted-foreground">
                      When working with third-party service providers who may have access to protected health
                      information, we enter into Business Associate Agreements to ensure they maintain the same level of
                      protection.
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Your Role in Data Security</h2>
              <p>
                While we take extensive measures to protect your health information, security is a shared
                responsibility. Here are some steps you can take to help keep your information secure:
              </p>
              <ul>
                <li>Use a strong, unique password for your MediVault account</li>
                <li>Enable two-factor authentication if available</li>
                <li>Be cautious about sharing your login credentials</li>
                <li>Log out of your account when using shared or public devices</li>
                <li>Keep your devices and browsers updated with the latest security patches</li>
                <li>Review your access logs periodically to ensure there is no unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about our HIPAA compliance measures or how we protect your health information,
                please contact us at:
              </p>
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
