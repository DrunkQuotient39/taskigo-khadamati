import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Messages } from '@/lib/i18n';

interface TermsProps {
  messages: Messages;
}

export default function Terms({ messages }: TermsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800 py-12"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Please read these terms carefully before using Taskego
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    By accessing and using Taskego (Khadamati), you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service apply to all users of the service, including but not limited to clients, service providers, and visitors.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    2. Service Description
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Taskego is a platform that connects clients with service providers for various home and professional services including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                    <li>Cleaning and housekeeping services</li>
                    <li>Maintenance and repair services</li>
                    <li>Professional consulting services</li>
                    <li>Delivery and transportation services</li>
                    <li>Other professional services as listed on the platform</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    3. User Responsibilities
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">For Clients:</h3>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>Provide accurate information about service requirements</li>
                        <li>Be present at scheduled appointment times</li>
                        <li>Ensure safe working conditions for service providers</li>
                        <li>Make payments as agreed upon booking</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">For Service Providers:</h3>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>Provide services professionally and competently</li>
                        <li>Arrive on time for scheduled appointments</li>
                        <li>Maintain appropriate licensing and insurance</li>
                        <li>Treat client property with respect and care</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    4. Payment Terms
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    All payments are processed securely through our platform. We support various payment methods including credit cards, debit cards, and digital wallets. Service fees are clearly displayed before booking confirmation.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                    <li>Payment is due upon completion of service unless otherwise arranged</li>
                    <li>Cancellation fees may apply as per our cancellation policy</li>
                    <li>Refunds are processed according to our refund policy</li>
                    <li>Platform service fees are non-refundable</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    5. Privacy and Data Protection
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We are committed to protecting your privacy and personal information. Our data collection and usage practices are outlined in our Privacy Policy. By using our service, you consent to the collection and use of information in accordance with our Privacy Policy.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    6. Limitation of Liability
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Taskego acts as a platform connecting clients and service providers. We are not responsible for the quality, completeness, or safety of services provided. Our liability is limited to the platform service fees paid. Users engage service providers at their own risk.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    7. Dispute Resolution
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    In case of disputes between clients and service providers, we provide mediation services to help resolve issues. For disputes involving the platform itself, we encourage users to contact our support team first. Unresolved disputes may be subject to arbitration.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    8. Changes to Terms
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated effective date. Continued use of the service after changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    9. Contact Information
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    For questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      Email: legal@taskego.com<br />
                      Phone: +1 (555) 123-4567<br />
                      Address: 123 Business Street, Tech City, TC 12345
                    </p>
                  </div>
                </section>

                <div className="text-center pt-8">
                  <p className="text-sm text-gray-500">
                    Last updated: January 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}