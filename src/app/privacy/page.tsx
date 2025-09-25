import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - HaircutFun',
  description: 'Privacy policy for HaircutFun virtual haircut try-on service',
  openGraph: {
    title: 'Privacy Policy - HaircutFun',
    description: 'Privacy policy for HaircutFun virtual haircut try-on service',
    url: 'https://haircutfun.com/privacy',
    siteName: 'HaircutFun',
    images: [
      {
        url: '/haircuttr.png',
        width: 1200,
        height: 630,
        alt: 'HaircutFun Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - HaircutFun',
    description: 'Privacy policy for HaircutFun virtual haircut try-on service',
    images: ['/haircuttr.png'],
  },
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 mb-4">
                At HaircutFun, we are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our virtual haircut try-on service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Technology Used</h2>
              <p className="text-gray-700 mb-4">
                Our service uses <strong>Google Gemini Flash 2.5</strong> artificial intelligence model to process and edit haircut images. This AI technology enables us to provide realistic virtual haircut try-on experiences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Collection and Storage</h2>
              <p className="text-gray-700 mb-4">
                <strong>We do not collect, store, or retain any of your personal data or images.</strong> Here&apos;s what happens when you use our service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Images you upload are processed in real-time</li>
                <li>No images are saved to our servers</li>
                <li>No personal information is collected or stored</li>
                <li>All processing is done temporarily and securely</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party AI Processing</h2>
              <p className="text-gray-700 mb-4">
                When you use our service, your images are processed by Google&apos;s Gemini Flash 2.5 model. While we don&apos;t store your data, Google may process your images according to their own privacy policies and terms of service.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>For detailed information about how Google handles your data, please review:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <a href="https://policies.google.com/privacy" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    Google Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://policies.google.com/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    Google Terms of Service
                  </a>
                </li>
                <li>
                  <a href="https://ai.google.dev/gemini-api/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    Google AI/Gemini API Terms
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                Since we don&apos;t collect or store your personal data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>There is no personal data to access, modify, or delete</li>
                <li>You maintain full control over any images you choose to upload</li>
                <li>You can stop using the service at any time without any data retention concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical measures to ensure the secure transmission of your images during processing. All communications are encrypted, and no data persists after processing is complete.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: admin@blackcubesolutions.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}