"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft, CheckCircle, Shield, Users, FileText, Calendar, Activity } from "lucide-react"

export default function AboutPage() {
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
        <div className="container max-w-4xl py-12 px-4 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              About MediVault
            </h1>
            <p className="text-xl text-muted-foreground">
              Empowering individuals to take control of their health information
            </p>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                MediVault was founded with a clear mission: to empower individuals to take control of their health
                information. We believe that everyone should have secure, easy access to their complete medical history,
                enabling better healthcare decisions and more effective communication with healthcare providers.
              </p>
              <p className="text-lg">
                In today's fragmented healthcare system, medical records are often scattered across multiple providers,
                making it difficult for individuals to maintain a comprehensive view of their health. MediVault solves
                this problem by providing a secure, centralized platform where users can store, organize, and share
                their health information.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 mb-4">
                    <img
                      src="/jayesh.jpg"
                      alt="Jayesh - Founder & Developer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Jayesh</h3>
                  <p className="text-sm text-muted-foreground mb-2">Founder & Lead Developer</p>
                  <p className="text-sm">
                    Full-stack developer with a passion for healthcare technology and data security.
                  </p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 mb-4">
                    <img
                      src="/team.jpg"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">The MediVault Team</h3>
                  <p className="text-sm text-muted-foreground mb-2">Developers, Designers & Healthcare Advisors</p>
                  <p className="text-sm">
                    A dedicated team of professionals committed to creating a secure, user-friendly platform.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
                  <p className="text-muted-foreground">
                    Bank-level encryption and security protocols to keep your health data safe and private.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FileText className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Medical History</h3>
                  <p className="text-muted-foreground">
                    Store and organize your complete medical history, including conditions, medications, and procedures.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Appointment Management</h3>
                  <p className="text-muted-foreground">
                    Schedule and track medical appointments with automated reminders.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Activity className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Health Metrics</h3>
                  <p className="text-muted-foreground">
                    Track vital health metrics over time with visual charts and trends.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Sharing</h3>
                  <p className="text-muted-foreground">
                    Securely share your health information with healthcare providers or family members.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Medication Reminders</h3>
                  <p className="text-muted-foreground">Never miss a dose with customizable medication reminders.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="bg-muted p-6 rounded-lg">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Privacy First</h3>
                    <p className="text-muted-foreground">We believe your health data belongs to you and only you.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">User-Centered Design</h3>
                    <p className="text-muted-foreground">
                      Every feature is designed with real users in mind, focusing on simplicity and accessibility.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Continuous Improvement</h3>
                    <p className="text-muted-foreground">
                      We're committed to constantly improving MediVault based on user feedback and healthcare
                      advancements.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Accessibility</h3>
                    <p className="text-muted-foreground">
                      We believe healthcare information should be accessible to everyone, regardless of technical
                      ability.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Join Us</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                We invite you to join the MediVault community and take control of your health information. Whether
                you're managing a chronic condition, coordinating care for a loved one, or simply want to be more
                organized with your health records, MediVault is designed for you.
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  >
                    Get Started Today
                  </Button>
                </Link>
              </div>
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
