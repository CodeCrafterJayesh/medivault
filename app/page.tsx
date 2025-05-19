"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MediVaultLogo } from "@/components/medivault-logo"
import { EnhancedMediVaultLogo } from "@/components/enhanced-medivault-logo"
import {
  Shield,
  Clock,
  Share2,
  FileText,
  BarChart2,
  Calendar,
  CheckCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function LandingPage() {
  const { toast } = useToast()

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name")
    const email = formData.get("email")
    const message = formData.get("message")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully. Thank you!",
          variant: "default",
        })
        e.currentTarget.reset()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MediVaultLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MediVault</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary">
              FAQ
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-primary/10 via-blue-50/50 to-background">
          <div className="container flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Your Health Records,{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Anytime, Anywhere
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto md:mx-0">
                MediVault securely stores your medical history, appointments, and health metrics in one place. Access
                and share your health information with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Learn More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] animate-float">
                <EnhancedMediVaultLogo className="w-full h-full text-primary" />
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

          {/* Animated dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/3 left-1/5 w-2 h-2 bg-primary rounded-full animate-ping"
              style={{ animationDuration: "3s", animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"
              style={{ animationDuration: "4s", animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-ping"
              style={{ animationDuration: "5s", animationDelay: "0s" }}
            ></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-br from-muted/30 to-muted/70">
          <div className="container">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
                Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Comprehensive Health Management
              </h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                MediVault provides all the tools you need to manage your health information effectively
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Shield className="h-10 w-10 text-primary" />}
                title="Secure Storage"
                description="Your health data is encrypted and securely stored, accessible only to you and those you authorize"
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
              />
              <FeatureCard
                icon={<FileText className="h-10 w-10 text-blue-500" />}
                title="Medical History"
                description="Keep track of your complete medical history, including conditions, allergies, and previous surgeries"
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
              />
              <FeatureCard
                icon={<Calendar className="h-10 w-10 text-green-500" />}
                title="Appointment Management"
                description="Schedule and manage your medical appointments with reminders and notifications"
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
              />
              <FeatureCard
                icon={<BarChart2 className="h-10 w-10 text-purple-500" />}
                title="Health Metrics"
                description="Track vital health metrics like blood pressure, heart rate, sleep, and more with visual charts"
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
              />
              <FeatureCard
                icon={<Clock className="h-10 w-10 text-amber-500" />}
                title="Medication Reminders"
                description="Never miss a dose with customizable medication reminders and schedules"
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
              />
              <FeatureCard
                icon={<Share2 className="h-10 w-10 text-rose-500" />}
                title="Secure Sharing"
                description="Securely share your health records with healthcare providers or family members"
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How MediVault Works</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Simple, secure, and designed with your health in mind
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Sign up for MediVault with your email and create a secure password
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Your Health Data</h3>
                <p className="text-muted-foreground">
                  Enter your medical history, medications, and upload important documents
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Access Anywhere</h3>
                <p className="text-muted-foreground">
                  Access your health information anytime, anywhere, and share securely when needed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Thousands of people trust MediVault with their health information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="MediVault has been a game-changer for managing my family's health records. I can easily share information with our doctors during appointments."
                author="Sarah Johnson"
                role="Parent of 3"
              />
              <TestimonialCard
                quote="As someone with multiple chronic conditions, keeping track of my medications and appointments was overwhelming. MediVault simplified everything."
                author="Michael Chen"
                role="Patient with Chronic Conditions"
              />
              <TestimonialCard
                quote="The ability to generate and share health reports has made coordinating care between my specialists so much easier. Highly recommended!"
                author="Emily Rodriguez"
                role="Healthcare Professional"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Find answers to common questions about MediVault
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <FaqItem
                question="Is my health data secure with MediVault?"
                answer="Yes, MediVault uses industry-standard encryption to protect your data. Your information is stored securely and is only accessible to you and those you explicitly authorize."
              />
              <FaqItem
                question="Can I access MediVault on my mobile device?"
                answer="MediVault is designed to be responsive and works seamlessly on smartphones, tablets, and desktop computers."
              />
              <FaqItem
                question="How do I share my health records with my doctor?"
                answer="MediVault allows you to generate secure, password-protected PDFs of your health records that you can share via email, WhatsApp, or other messaging platforms. You can also generate temporary access links."
              />
              <FaqItem
                question="Is there a cost to use MediVault?"
                answer="MediVault offers a free basic plan that includes essential features. Premium plans with advanced features are available for a monthly subscription."
              />
              <FaqItem
                question="Can I track health metrics like blood pressure and heart rate?"
                answer="Yes, MediVault allows you to track various health metrics including blood pressure, heart rate, sleep, steps, and more. You can visualize this data with interactive charts."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="container text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
            <p className="text-xl max-w-[800px] mx-auto mb-8 text-primary-foreground/90">
              Join thousands of users who trust MediVault with their health information
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Have questions or feedback? We'd love to hear from you
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="w-full p-2 border rounded-md"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="Your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MediVaultLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">MediVault</span>
              </div>
              <p className="text-muted-foreground">Secure Your Health, Anytime, Anywhere</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-muted-foreground hover:text-primary">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-muted-foreground hover:text-primary">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/creator-space" className="text-muted-foreground hover:text-primary">
                    Creator Space
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/hipaa" className="text-muted-foreground hover:text-primary">
                    HIPAA Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MediVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  className,
}: { icon: React.ReactNode; title: string; description: string; className?: string }) {
  return (
    <div className={cn("rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border", className)}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <div className="mb-4 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </div>
      <p className="mb-4 italic">{quote}</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2 flex items-start">
        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
        <span>{question}</span>
      </h3>
      <p className="text-muted-foreground pl-7">{answer}</p>
    </div>
  )
}
