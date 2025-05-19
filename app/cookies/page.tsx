"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MediVaultLogo } from "@/components/medivault-logo"
import { ArrowLeft } from "lucide-react"

export default function CookiePolicyPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: May 18, 2024</p>
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2>What Are Cookies</h2>
              <p>
                Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is
                stored in your web browser and allows the service or a third-party to recognize you and make your next
                visit easier and the service more useful to you.
              </p>
              <p>
                Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your personal computer or
                mobile device when you go offline, while session cookies are deleted as soon as you close your web
                browser.
              </p>
            </section>

            <section className="mb-8">
              <h2>How MediVault Uses Cookies</h2>
              <p>
                When you use and access our service, we may place a number of cookie files in your web browser. We use
                cookies for the following purposes:
              </p>
              <ul>
                <li>
                  <strong>Essential cookies:</strong> These cookies are required for the operation of our website. They
                  include, for example, cookies that enable you to log into secure areas of our website.
                </li>
                <li>
                  <strong>Analytical/performance cookies:</strong> These allow us to recognize and count the number of
                  visitors and to see how visitors move around our website when they are using it. This helps us to
                  improve the way our website works, for example, by ensuring that users are finding what they are
                  looking for easily.
                </li>
                <li>
                  <strong>Functionality cookies:</strong> These are used to recognize you when you return to our
                  website. This enables us to personalize our content for you and remember your preferences.
                </li>
                <li>
                  <strong>Authentication cookies:</strong> These cookies help us identify our users and ensure that they
                  can access their accounts. These cookies are essential for using our service.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>Types of Cookies We Use</h2>
              <p>We use both first-party and third-party cookies for several reasons.</p>

              <h3>First-party cookies</h3>
              <ul>
                <li>
                  <strong>Session cookies:</strong> These are temporary cookies that expire when you close your browser.
                  They are used to keep you logged in as you navigate through our site.
                </li>
                <li>
                  <strong>Persistent cookies:</strong> These remain on your device until they expire or you delete them.
                  They are used to remember your preferences and settings when you visit our site again.
                </li>
              </ul>

              <h3>Third-party cookies</h3>
              <ul>
                <li>
                  <strong>Analytics cookies:</strong> We use services like Google Analytics which set cookies to help us
                  understand how visitors interact with our website.
                </li>
                <li>
                  <strong>Security cookies:</strong> These cookies help us detect and prevent security risks.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2>What Specific Cookies We Use</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Cookie Name</th>
                    <th className="border p-2 text-left">Purpose</th>
                    <th className="border p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">sb-[id]-auth-token</td>
                    <td className="border p-2">Authentication cookie used to keep you logged in</td>
                    <td className="border p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border p-2">medivault-preferences</td>
                    <td className="border p-2">Stores your preferences such as theme choice</td>
                    <td className="border p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border p-2">_ga</td>
                    <td className="border p-2">Google Analytics cookie used to distinguish users</td>
                    <td className="border p-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border p-2">_gid</td>
                    <td className="border p-2">Google Analytics cookie used to distinguish users</td>
                    <td className="border p-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mb-8">
              <h2>How to Control Cookies</h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your
                computer and you can set most browsers to prevent them from being placed. If you do this, however, you
                may have to manually adjust some preferences every time you visit a site and some services and
                functionalities may not work.
              </p>
              <p>
                Most web browsers allow some control of most cookies through the browser settings. To find out more
                about cookies, including how to see what cookies have been set and how to manage and delete them, visit{" "}
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
                  www.allaboutcookies.org
                </a>
                .
              </p>
              <p>
                To opt out of being tracked by Google Analytics across all websites, visit{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                  https://tools.google.com/dlpage/gaoptout
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2>Changes to This Cookie Policy</h2>
              <p>
                We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new
                Cookie Policy on this page and updating the "Last Updated" date at the top of this page.
              </p>
              <p>
                You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy
                are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>If you have any questions about our Cookie Policy, please contact us at:</p>
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
