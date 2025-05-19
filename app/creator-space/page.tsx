"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft, Calendar, Code, Heart, Lightbulb, Shield, Star } from "lucide-react"

export default function CreatorSpace() {
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
              Creator Space
            </h1>
            <p className="text-xl text-muted-foreground">The Innovative Mind Behind MediVault</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-16">
            <div className="w-50 h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl flex-shrink-0">
              <img
               src="/jayesh.jpg"
                alt="Jayesh - Creator of MediVault"
                className="w-full h-full object-cover"

              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Jayesh</h2>
              <div className="prose max-w-none dark:prose-invert">
                <p className="text-lg">
                  Full-stack developer and healthcare enthusiast with a passion for creating technology that makes a
                  difference in people's lives. With expertise in React, Next.js, and cloud technologies, I've dedicated
                  my skills to solving real-world problems in the healthcare space.
                </p>
                <p className="text-lg">
                  My journey in tech began over 5 years ago, and I've since worked on various projects ranging from
                  e-commerce platforms to enterprise solutions. However, MediVault represents my most personal and
                  impactful project to date.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Lightbulb className="mr-2 h-6 w-6 text-primary" />
              Why I Created MediVault
            </h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                The idea for MediVault came from a personal experience. When a family member faced a medical emergency
                while traveling, we struggled to provide doctors with their complete medical history. This delay in
                sharing critical information highlighted a gap in how we manage our health records.
              </p>
              <p className="text-lg">
                I realized that in our digital age, there should be a secure, accessible way for individuals to store
                and share their medical information. This realization led to the development of MediVault – a platform
                designed to empower people to take control of their health data.
              </p>
              <p className="text-lg">
                My vision is to create a world where no one faces delays in treatment due to inaccessible medical
                records, where healthcare providers can make informed decisions quickly, and where individuals have
                complete ownership of their health information.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 p-8 rounded-lg mb-16">
            <blockquote className="text-2xl md:text-3xl italic font-serif text-center">
              "Health is Real Wealth!"
            </blockquote>
            <p className="text-right mt-4 text-muted-foreground">— Jayesh</p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Star className="mr-2 h-6 w-6 text-primary" />
              Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-xl font-semibold">Privacy & Security</h3>
                </div>
                <p className="text-muted-foreground">
                  Your health data is yours alone. MediVault is built with security as the foundation, ensuring your
                  information remains private and protected.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Heart className="h-6 w-6 text-red-500 mr-2" />
                  <h3 className="text-xl font-semibold">Empathy-Driven Design</h3>
                </div>
                <p className="text-muted-foreground">
                  Every feature is designed with real users in mind, focusing on accessibility, ease of use, and solving
                  genuine problems.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Code className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="text-xl font-semibold">Technical Excellence</h3>
                </div>
                <p className="text-muted-foreground">
                  Using cutting-edge technologies and best practices to deliver a reliable, performant, and future-proof
                  platform.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-500 mr-2" />
                  <h3 className="text-xl font-semibold">Continuous Improvement</h3>
                </div>
                <p className="text-muted-foreground">
                  MediVault is constantly evolving based on user feedback and healthcare advancements to better serve
                  your needs.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Development Timeline</h2>
            <div className="relative border-l-2 border-primary/30 pl-8 space-y-8 ml-4">
              <div className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-semibold">Concept & Research</h3>
                <p className="text-sm text-muted-foreground mb-2">Q1 2023</p>
                <p>
                  Initial concept development and market research to validate the need for a personal health record
                  platform.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-semibold">MVP Development</h3>
                <p className="text-sm text-muted-foreground mb-2">Q2 2023</p>
                <p>
                  Development of the minimum viable product with core features for health record storage and sharing.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-semibold">Beta Launch</h3>
                <p className="text-sm text-muted-foreground mb-2">Q3 2023</p>
                <p>Limited release to beta users for testing and feedback collection.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-semibold">Public Release</h3>
                <p className="text-sm text-muted-foreground mb-2">Q4 2023</p>
                <p>Official launch of MediVault with enhanced features based on beta feedback.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h3 className="text-xl font-semibold">Mobile App Development</h3>
                <p className="text-sm text-muted-foreground mb-2">Q1 2024</p>
                <p>Expansion to mobile platforms for improved accessibility and convenience.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-green-500"></div>
                <h3 className="text-xl font-semibold">Continuous Improvement</h3>
                <p className="text-sm text-muted-foreground mb-2">Present</p>
                <p>Ongoing development and enhancement based on user feedback and healthcare industry advancements.</p>
              </div>
            </div>
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
