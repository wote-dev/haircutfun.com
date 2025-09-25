"use client";

import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Shield, Users, Zap, Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use - HaircutFun',
  description: 'Terms of use for HaircutFun virtual haircut try-on service',
}

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Use</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using HaircutFun's AI-powered virtual haircut service.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Legal Document
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                AI-Powered Service
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto pr-4 space-y-8">

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using HaircutFun (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 mb-4">
                HaircutFun is a virtual haircut try-on service that uses artificial intelligence to help users visualize different hairstyles. Our service is powered by <strong>Google Gemini Flash 2.5</strong>, an advanced AI model that processes and edits images to create realistic haircut previews.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Technology and Processing</h2>
              <p className="text-gray-700 mb-4">
                Our service utilizes <strong>Google Gemini Flash 2.5</strong> for image processing and haircut editing. By using our service, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Your images will be processed by Google's AI technology</li>
                <li>The AI-generated results are for preview purposes only</li>
                <li>Results may vary and are not guaranteed to be perfectly accurate</li>
                <li>The technology is continuously improving and results may change over time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-700 mb-4">When using our service, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Only upload images that you own or have permission to use</li>
                <li>Not upload inappropriate, offensive, or illegal content</li>
                <li>Not use the service for any unlawful purposes</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not attempt to reverse engineer or misuse our AI technology</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data and Privacy</h2>
              <p className="text-gray-700 mb-4">
                We do not collect, store, or retain any of your personal data or images. However, your images are processed by Google Gemini Flash 2.5 Preview, which is subject to Google's own privacy policies and terms of service.
              </p>
              <p className="text-gray-700 mb-4">
                For complete information about data handling, please review our <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a> and Google's relevant policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-4">
                The service is provided &quot;as is&quot; without any warranties, expressed or implied. We do not warrant that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>The service will meet your specific requirements</li>
                <li>The service will be uninterrupted, timely, secure, or error-free</li>
                <li>The results obtained from the use of the service will be accurate or reliable</li>
                <li>Any errors in the service will be corrected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall HaircutFun be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the service, even if we have been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our service relies on Google Gemini Flash 2.5 for AI processing. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Google's terms of service and privacy policies also apply to your use of our service</li>
                <li>We are not responsible for any changes to Google's services or policies</li>
                <li>Service availability may be affected by third-party service availability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The HaircutFun service, including its design, functionality, and content, is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which HaircutFun operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Use, please contact us at:
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>admin@blackcubesolutions.com</span>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    By using our service, you agree to these terms
                  </span>
                </div>
                <Link href="/privacy">
                  <Button variant="ghost" size="sm">
                    Privacy Policy
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}