"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft, CheckCircle, Clock, Calendar } from "lucide-react"

export default function RoadmapPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">MediVault Roadmap</h1>
            <p className="text-xl text-muted-foreground">Our vision and upcoming features</p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Vision</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                MediVault is on a mission to transform how individuals manage their health information. Our roadmap is
                guided by our core vision: to create a world where everyone has secure, easy access to their complete
                medical history, enabling better healthcare decisions and more effective communication with healthcare
                providers.
              </p>
              <p className="text-lg">
                We're building MediVault to be more than just a storage solution—we envision a comprehensive health
                management platform that empowers users to take control of their health journey, from tracking
                medications and appointments to sharing records with healthcare providers and analyzing health trends.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Development Timeline</h2>

            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium">
                  Completed
                </div>
              </div>

              <div className="relative border-l-2 border-green-500/30 pl-8 space-y-8 ml-4">
                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-green-500"></div>
                  <h3 className="text-xl font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Core Platform Launch
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Q1 2024</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Secure user authentication and account management</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Basic medical history storage and organization</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Appointment tracking and reminders</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Medication management system</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Emergency contact information</span>
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-green-500"></div>
                  <h3 className="text-xl font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Enhanced Security & Sharing
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Q2 2024</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Advanced encryption for all health data</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Secure document sharing with healthcare providers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Granular permission controls for shared information</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1" />
                      <span>Two-factor authentication</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                  In Progress
                </div>
              </div>

              <div className="relative border-l-2 border-blue-500/30 pl-8 space-y-8 ml-4">
                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
                  <h3 className="text-xl font-semibold flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    Health Analytics & Insights
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Q3 2024</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 text-blue-500 mr-2 mt-1" />
                      <span>Interactive health metrics dashboards</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 text-blue-500 mr-2 mt-1" />
                      <span>Trend analysis for vital health data</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 text-blue-500 mr-2 mt-1" />
                      <span>Customizable health reports</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 text-blue-500 mr-2 mt-1" />
                      <span>Medication effectiveness tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                  Planned
                </div>
              </div>

              <div className="relative border-l-2 border-purple-500/30 pl-8 space-y-8 ml-4">
                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-purple-500"></div>
                  <h3 className="text-xl font-semibold flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    Mobile Applications
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Q4 2024</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Native iOS and Android applications</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Offline access to critical health information</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Push notifications for medication and appointment reminders</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Integration with health tracking devices and apps</span>
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-purple-500"></div>
                  <h3 className="text-xl font-semibold flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    Healthcare Provider Integration
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Q1 2025</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Direct integration with electronic health record (EHR) systems</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Secure messaging with healthcare providers</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Automated import of lab results and medical records</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Telehealth appointment integration</span>
                    </li>
                  </ul>
                </div>

                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-purple-500"></div>
                  <h3 className="text-xl font-semibold flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                    Advanced Features
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">Q2-Q4 2025</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>AI-powered health insights and recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Family health management</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Genetic information storage and analysis</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>International health record standards compliance</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2 mt-1" />
                      <span>Research participation options (anonymized data sharing)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Your Input Matters</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                Our roadmap is guided by user feedback and evolving healthcare needs. We're committed to building
                features that truly enhance your ability to manage your health information effectively.
              </p>
              <p className="text-lg">
                Have a suggestion for a feature you'd like to see in MediVault? We'd love to hear from you! Please share
                your ideas and feedback at medivaultdigihealth@gmail.com.
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/contact">
                  <Button>Share Your Feedback</Button>
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
