"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowUp,
  Shield,
  Users,
  Database,
  Eye,
  Lock,
  Clock,
  Mail,
  FileText,
  Globe,
  RefreshCw,
} from "lucide-react";

// == Section Header helper included ==
function SectionIconHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
    </div>
  );
}

export default function GeneralPrivacyPolicyPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const sections = [
    { id: "who-we-are", title: "Who We Are", icon: Users },
    { id: "personal-data", title: "Personal Data We Process", icon: Database },
    {
      id: "why-we-process",
      title: "Why We Process Your Personal Data",
      icon: Eye,
    },
    {
      id: "how-we-process",
      title: "How We Process Your Personal Data",
      icon: Database,
    },
    {
      id: "how-we-disclose",
      title: "How We Disclose Your Personal Data",
      icon: Users,
    },
    {
      id: "international-transfers",
      title: "International Transfers",
      icon: Globe,
    },
    {
      id: "how-we-protect",
      title: "How We Protect Your Personal Data",
      icon: Lock,
    },
    {
      id: "storage-period",
      title: "How Long We Store Your Personal Data",
      icon: Clock,
    },
    { id: "your-rights", title: "Your Privacy Rights", icon: Shield },
    { id: "jurisdictions", title: "Non-EU Jurisdictions", icon: Globe },
    {
      id: "california-privacy",
      title: "California Privacy Rights",
      icon: Globe,
    },
    { id: "contact-us", title: "Contact Us", icon: Mail },
    { id: "changes", title: "Changes to this Policy", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            General Privacy Policy
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            How Paciwire Technology Pvt Ltd protects and manages your personal
            information
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Last updated: January 2023
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-12 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                About This Policy
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                As{" "}
                <strong>
                  Paciwire Technologies Unit NO 201, Second Floor Iris Tech
                  Park, Sector-48, Sohna Road, Gurugram, Haryana 122001
                  (Mycleanone)
                </strong>{" "}
                is part of the Paciwire Group, we are joined with companies
                providing leading technology solutions in cybersecurity, privacy
                and identity protection. To enhance the functioning of your
                devices and improve your experience online, we collect your data
                to provide you with the best tools. We do not take your trust
                for granted so we’ve developed a Privacy Policy that covers how
                we collect, use, disclose, transfer, and store your personal
                data.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 mb-12 shadow-xl border border-white/20 dark:border-slate-700/50">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Table of Contents
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-3 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                  <section.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ================= POLICY SECTIONS ===================== */}
        <div className="space-y-32">
          {/* WHO WE ARE */}
          <section id="who-we-are" className="policy-section">
            <SectionIconHeader icon={Users} title="Who We Are" />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <p>
                <strong>
                  Paciwire Technologies Unit NO 201, Second Floor Iris Tech
                  Park, Sector-48, Sohna Road, Gurugram, Haryana 122001
                  (Mycleanone)
                </strong>{" "}
                is a multinational company based in India and belongs to the
                Paciwire group.
              </p>
              <p>
                The Controller of your personal data is{" "}
                <strong>Paciwire Technologies Private Ltd</strong>, principal
                place of business: <br />
                Unit NO 201, Second Floor Iris Tech Park, Sector-48, Sohna Road,
                Gurugram, Haryana 122001.
              </p>
              <p>
                This Privacy Policy describes how we handle and protect your
                personal data and the choices available to you. Additional
                information on our personal data practices may be provided in
                product settings, contractual terms, or notices provided prior
                to or at the time of data collection.
              </p>
              <p>
                This Privacy Policy is intended if you are a user of our
                products and services. If you are a business partner, see the
                Business Partner Policy.
              </p>
            </div>
          </section>

          {/* PERSONAL DATA WE PROCESS */}
          <section id="personal-data" className="policy-section">
            <SectionIconHeader
              icon={Database}
              title="Personal Data We Process"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <p>
                We may collect data or ask you to provide certain data when you
                use our websites, products and services.
              </p>
              <ul>
                <li>
                  Data collected directly from you or your device, e.g. your
                  name, address, email, phone number, IP, or social media
                  account.
                </li>
                <li>
                  If we link other data relating to you with your Personal Data,
                  we treat that as Personal Data.
                </li>
                <li>
                  We may collect Personal Data from trusted third-party sources
                  such as distributors, resellers, app stores, etc.
                </li>
              </ul>
              <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <strong>Note:</strong> We do <em>not</em> process special
                categories of personal data such as health, race, ethnicity or
                political opinions, nor deduce these from data we collect.
              </div>
              <p>
                Personal Data we process is typically grouped into two
                categories: <strong>Billing Data</strong> and{" "}
                <strong>Product Data</strong>.
              </p>
              <h3>Billing Data</h3>
              <p>
                Billing Data includes your name, email, masked credit card
                number, license info and (sometimes) address and phone number.
                When you purchase through a third-party or reseller, your data
                is processed per their privacy policy; we only keep a subset.
                Usage includes:
              </p>
              <div className="overflow-x-auto my-6">
                <table className="w-full bg-white dark:bg-slate-800/50 rounded-lg shadow-md overflow-hidden">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Billing Data
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        What we use it for
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3 font-medium">Name</td>
                      <td className="px-4 py-3">
                        To identify you as license owner
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Email address</td>
                      <td className="px-4 py-3">
                        To send you purchase receipts
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">
                        Postcode and country
                      </td>
                      <td className="px-4 py-3">
                        Tax regime and correct billing currency
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">
                        Masked credit card number
                      </td>
                      <td className="px-4 py-3">For payment/billing records</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">License key</td>
                      <td className="px-4 py-3">For troubleshooting</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">License type</td>
                      <td className="px-4 py-3">To enable features</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Renewability</td>
                      <td className="px-4 py-3">
                        To check if a subscription can be renewed
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Date of expiry</td>
                      <td className="px-4 py-3">
                        To check validity of a license
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                For some features, e.g. the forum, you may provide extra data,
                such as bio, contact details, avatar, etc.
              </p>
              <h3>Product Data</h3>
              <p>
                <strong>Device Data</strong> includes info such as OS, hardware,
                city/country, error logs, browser, network, and installed
                applications. <strong>Service Data</strong> includes usage
                statistics, preferences, installed browsers, IP address, etc.
              </p>
              <p>Details differ per product; see Products Policy for more.</p>
            </div>
          </section>

          {/* WHY WE PROCESS */}
          <section id="why-we-process" className="policy-section">
            <SectionIconHeader
              icon={Eye}
              title="Why We Process Your Personal Data"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <h4>On the basis of fulfilling our contract with you</h4>
              <ul>
                <li>Process purchases and licenses</li>
                <li>
                  Provision of downloads, activation, and product operation
                </li>
                <li>Keep products up to date and secure</li>
                <li>Verify identity for support/services</li>
                <li>Process transactions and update licenses</li>
                <li>Manage subscriptions, user accounts</li>
                <li>
                  Provide customer/tech support (may include remote access)
                </li>
              </ul>
              <h4>On the basis of your consent</h4>
              <ul>
                <li>Newsletter subscription</li>
                <li>Personalized/third-party ads (for free products)</li>
              </ul>
              <h4>On basis of legal obligations</h4>
              <p>
                Compliance with tax, accounting, legal orders, anti-money
                laundering or sanction checks.
              </p>
              <h4>On the basis of legitimate interest</h4>
              <ul>
                <li>Security, privacy, performance notices</li>
                <li>
                  Performance/quality evaluation and improvement; analytics
                </li>
                <li>Secure systems</li>
                <li>Internal business management</li>
                <li>Defend our legal rights</li>
              </ul>
              <div className="bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
                Your interests are considered in all processing operations; you
                have the right to object (see "Your Privacy Rights").
              </div>
            </div>
          </section>

          {/* HOW WE PROCESS */}
          <section id="how-we-process" className="policy-section">
            <SectionIconHeader
              icon={Database}
              title="How We Process Your Personal Data"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <p>
                We disconnect or remove all direct identifiers from the Personal
                Data we use.
              </p>
              <ul>
                <li>
                  For free versions, removal/disconnection begins at activation.
                </li>
                <li>
                  For paid, Billing Data is kept separately, only for
                  financial/required purposes.
                </li>
                <li>
                  Ongoing efforts to minimize and disconnect identifiers
                  throughout usage.
                </li>
              </ul>
              <h4>Processing of IP Addresses</h4>
              <p>
                Your IP may be used for product download, licensing, and fraud
                prevention. Payment partners collect your IP (we do not retain).
              </p>
              <h4>Personalization</h4>
              <p>
                We do not make automated decisions (profiling) that
                significantly affect you.
              </p>
            </div>
          </section>

          {/* HOW WE DISCLOSE */}
          <section id="how-we-disclose" className="policy-section">
            <SectionIconHeader
              icon={Users}
              title="How We Disclose Your Personal Data"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <ul>
                <li>
                  <strong>Payment processors:</strong> Authorized payment
                  providers process your Billing Data. Their privacy policies
                  apply.
                </li>
                <li>
                  <strong>Service providers:</strong> E.g., contact centers,
                  analytics providers, consultants—bound by confidentiality.
                </li>
                <li>
                  <strong>Advertising:</strong> For some free products, ads are
                  shown; SDKs may collect your data—with your consent.
                </li>
                <li>
                  <strong>Distribution partners:</strong> For sales and
                  communication, may process your data as independent
                  controllers.
                </li>
                <li>
                  <strong>Cookies and analytics:</strong> Used for
                  personalization, campaign effectiveness, product improvement,
                  etc. See our Cookie Policy for details.
                </li>
                <li>
                  <strong>Authorities:</strong> Only as required by law,
                  subpoena, court request, fraud/credit checks.
                </li>
                <li>
                  <strong>Mergers/acquisitions:</strong> Data may be transferred
                  as part of such transactions; users are notified where
                  required.
                </li>
              </ul>
            </div>
          </section>

          {/* INTERNATIONAL TRANSFERS */}
          <section id="international-transfers" className="policy-section">
            <SectionIconHeader icon={Globe} title="International Transfers" />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <p>
                As a global company, servers may be in other countries,
                including outside the EEA. Regardless, we maintain GDPR-level
                protection. EEA data transfers are handled using Standard
                Contractual Clauses or similar legal mechanisms.
              </p>
              <p>
                This may include access by non-EEA personnel for storage,
                provisioning, payments, support, or in event of a
                merger/acquisition.
              </p>
            </div>
          </section>

          {/* HOW WE PROTECT */}
          <section id="how-we-protect" className="policy-section">
            <SectionIconHeader
              icon={Lock}
              title="How We Protect Your Personal Data"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <ul>
                <li>
                  <strong>Administrative:</strong> Access limited to authorized
                  staff. Third-parties bound by confidentiality.
                </li>
                <li>
                  <strong>Technical:</strong> Secure databases, firewalls,
                  antivirus/malware, regular updates.
                </li>
                <li>
                  <strong>Physical:</strong> Restricted premises, VPN for remote
                  access, no external data removal permitted.
                </li>
                <li>
                  <strong>Proportionality:</strong> Only minimal,
                  purpose-limited data is collected.
                </li>
              </ul>
            </div>
          </section>

          {/* STORAGE PERIOD */}
          <section id="storage-period" className="policy-section">
            <SectionIconHeader
              icon={Clock}
              title="How Long We Store Your Personal Data"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <ul>
                <li>
                  <strong>Billing Data:</strong> As long as legally required or
                  for legal rights.
                </li>
                <li>
                  <strong>Account Data:</strong> While your account is active.
                </li>
                <li>
                  <strong>Product Data:</strong> Only as needed, rolling
                  deletion, generally ≤6 years.
                </li>
              </ul>
              <p>
                Data may be stored in the Czech Republic, USA, or elsewhere,
                with technical and organizational security measures in place.
              </p>
            </div>
          </section>

          {/* USER RIGHTS */}
          <section id="your-rights" className="policy-section">
            <SectionIconHeader icon={Shield} title="Your Privacy Rights" />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <ul>
                <li>Right to information</li>
                <li>Right of access</li>
                <li>Right to rectification</li>
                <li>Right of erasure ("right to be forgotten")</li>
                <li>Right to portability</li>
                <li>Right to object</li>
                <li>Right to withdraw consent</li>
                <li>Right to restrict processing</li>
                <li>Right to complain to a supervisory authority/court</li>
              </ul>
              <p>
                For requests, use the Contact Us section; we usually respond
                within a month. Unidentifiable free-software users may be unable
                to exercise these rights.
              </p>
            </div>
          </section>

          {/* NON-EU JURISDICTIONS */}
          <section id="jurisdictions" className="policy-section">
            <SectionIconHeader icon={Globe} title="Non-EU Jurisdictions" />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <strong>Russian Federation:</strong>
              <p>
                All Personal Data processing is in strict compliance with
                Russian law. Consent is obtained; Russian citizens’ data is
                stored in Russia (with some exceptions per law). Requests or
                revocation must be sent to us using the Contact details below.
                This section prevails for Russian residents if contradiction
                arises.
              </p>
            </div>
          </section>

          {/* CALIFORNIA */}
          <section id="california-privacy" className="policy-section">
            <SectionIconHeader icon={Globe} title="California Privacy Rights" />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <ul>
                <li>
                  Right to know what data is collected, processed,
                  sold/disclosed
                </li>
                <li>Right to request correction</li>
                <li>Right to opt out of sale/sharing</li>
                <li>Right to limit use/disclosure of sensitive data</li>
                <li>Right to deletion (unless an exemption applies)</li>
                <li>
                  Right to access (portable, usable format, up to twice/12mo)
                </li>
                <li>Right to non-discrimination</li>
              </ul>
              <p>
                We do not knowingly sell data of minors under 16. For opt-out,
                see our “Do Not Sell or Share My Personal Information” page. Use
                the Contact section below for requests; requests may require
                verification or authorized agent.
              </p>
            </div>
          </section>

          {/* CONTACT US */}
          <section id="contact-us" className="policy-section">
            <SectionIconHeader icon={Mail} title="Contact Us" />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <p>
                To exercise your rights or for privacy questions/complaints:
              </p>
              <ul>
                <li>Use the online form (see brand website)</li>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:customerservice@mycleanone.com"
                    className="text-blue-600 underline"
                  >
                    customerservice@mycleanone.com
                  </a>{" "}
                  (subject: “PRIVACY REQUEST”)
                </li>
                <li>
                  Or mail:{" "}
                  <code>
                    Paciwire Technologies Unit NO 201, Second Floor Iris Tech
                    Park, Sector-48, Sohna Road, Gurugram, Haryana 122001
                  </code>{" "}
                  (mark: "Attention: PRIVACY")
                </li>
                <li>
                  US-based third-party dispute:{" "}
                  <a
                    href="https://feedback-form.truste.com/watchdog/request"
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener"
                  >
                    feedback-form.truste.com
                  </a>
                </li>
              </ul>
              <h4>Data Protection Officer (for GDPR queries):</h4>
              <p>
                Email:{" "}
                <a
                  href="mailto:dpo@mycleanone.com"
                  className="text-blue-600 underline"
                >
                  dpo@mycleanone.com
                </a>
              </p>
            </div>
          </section>

          {/* UPDATES */}
          <section id="changes" className="policy-section">
            <SectionIconHeader
              icon={RefreshCw}
              title="Changes to this Policy"
            />
            <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300">
              <p>
                We reserve the right to revise or modify this Privacy Policy at
                any time. Material changes will be notified by email (to the
                address in your account), in-product, or on this website prior
                to such changes becoming effective.
              </p>
              <p>
                We encourage you to periodically review this page for the latest
                information.
              </p>
            </div>
          </section>
        </div>

        {/* BACK TO TOP BUTTON */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
            showBackToTop ? "" : "hidden"
          }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
