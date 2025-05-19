"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react"

export default function BlogPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">MediVault Blog</h1>
            <p className="text-xl text-muted-foreground">Insights, updates, and health information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <article className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?height=250&width=500"
                  alt="The Future of Digital Health Records"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>May 15, 2024</span>
                  <span className="mx-2">•</span>
                  <User className="h-4 w-4 mr-1" />
                  <span>Jayesh</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">The Future of Digital Health Records</h2>
                <p className="text-muted-foreground mb-4">
                  Explore how digital health records are transforming healthcare delivery and patient outcomes. Learn
                  about the latest innovations and what to expect in the coming years.
                </p>
                <Link href="#">
                  <Button variant="outline" className="w-full">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </article>

            <article className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted relative">
                <img
                  src="/placeholder.svg?height=250&width=500"
                  alt="5 Tips for Managing Your Medical Information"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>May 8, 2024</span>
                  <span className="mx-2">•</span>
                  <User className="h-4 w-4 mr-1" />
                  <span>MediVault Team</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">5 Tips for Managing Your Medical Information</h2>
                <p className="text-muted-foreground mb-4">
                  Effective management of your medical information can lead to better healthcare outcomes. Discover
                  practical tips for organizing and accessing your health records.
                </p>
                <Link href="#">
                  <Button variant="outline" className="w-full">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </article>
          </div>

          <div className="text-center p-12 bg-muted rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">More Content Coming Soon!</h2>
            <p className="text-muted-foreground mb-6">
              We're working on more informative articles about health management, technology, and wellness. Check back
              soon for updates or subscribe to our newsletter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>Subscribe to Updates</Button>
              <Link href="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
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
