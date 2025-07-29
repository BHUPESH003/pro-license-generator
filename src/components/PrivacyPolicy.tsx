"use client";
import React from "react";
import {
  Shield,
  Database,
  Settings,
  Share2,
  Cookie,
  Lock,
  RefreshCw,
  Mail,
  FileText,
  Eye,
  Users,
  Globe,
  AlertTriangle,
  CheckCircle,
  Building,
  Calendar,
  Phone,
  Info,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Paciwire Technology Pvt Ltd - Last updated June 30, 2024
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Building className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              About This Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Our Commitment to Privacy
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 leading-relaxed">
                  This Privacy Policy outlines how{" "}
                  <strong>Paciwire Technology Pvt Ltd</strong>
                  collects, uses, stores, and discloses personal information
                  that is provided to us through our website and other services.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Your Protection
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 leading-relaxed">
                  We are committed to protecting your personal information and
                  maintaining transparency about how we handle your data across
                  all our services and platforms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Policy Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Database className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium text-gray-900">
                  Information We Collect
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Settings className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium text-gray-900">
                  How We Use Information
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Share2 className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium text-gray-900">
                  Sharing Information
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Cookie className="h-5 w-5 text-orange-500 mr-2" />
                <span className="font-medium text-gray-900">
                  Cookies & Tracking
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <Lock className="h-5 w-5 text-purple-500 mr-2" />
                <span className="font-medium text-gray-900">
                  Security Measures
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <RefreshCw className="h-5 w-5 text-indigo-500 mr-2" />
                <span className="font-medium text-gray-900">
                  Policy Changes
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Information We Collect
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 leading-relaxed">
                We collect personal information when you visit our website,
                register an account, place an order, subscribe to our
                newsletter, or otherwise interact with us.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Personal Information
                </h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Name and contact details</li>
                <li>• Email address</li>
                <li>• Mailing address</li>
                <li>• Phone number</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Lock className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Payment Information
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Payment information and other details necessary to process your
                order or provide our services.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Globe className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Interaction Data
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Information collected through your interactions with our
                website, services, and customer support.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-green-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              How We Use Your Information
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 leading-relaxed">
                We use your personal information to provide our services to you,
                including processing your orders, sending you updates and
                notifications, and responding to your inquiries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Service Provision
                </h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Processing your orders</li>
                <li>• Sending updates and notifications</li>
                <li>• Responding to inquiries</li>
                <li>• Customer support</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Eye className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Improvement & Marketing
                </h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Website improvement</li>
                <li>• Personalizing your experience</li>
                <li>• Sending marketing communications</li>
                <li>• Service optimization</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sharing Your Information */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Share2 className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Sharing Your Information
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 leading-relaxed">
                We may share your personal information with our third-party
                service providers who assist us in providing our services to
                you. We may also share your information with our affiliates and
                partners for marketing purposes.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Important Promise
                </h3>
                <p className="text-yellow-800 text-sm">
                  We will never sell or rent your personal information to third
                  parties without your consent, except as required by law.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Service Providers
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Third-party service providers who assist us in delivering our
                services, processing payments, and maintaining our platform.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Building className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Affiliates & Partners
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Our affiliates and partners for marketing purposes, always with
                appropriate privacy protections in place.
              </p>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Cookie className="h-6 w-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Cookies & Tracking Technologies
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 leading-relaxed">
                We use cookies and other tracking technologies to improve your
                experience on our website, analyze usage, and personalize
                content and advertising.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Eye className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Website Experience
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Improve your browsing experience and website functionality.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Database className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Usage Analysis</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Analyze how you use our website to improve our services.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Settings className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Personalization</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Personalize content and advertising based on your preferences.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-sm text-gray-700">
              <strong>Cookie Control:</strong> You can disable cookies in your
              browser settings, but please note that this may affect your
              experience on our website.
            </p>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-purple-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Security Measures
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-purple-800 leading-relaxed">
                We take reasonable measures to protect your personal information
                from unauthorized access, use, disclosure, alteration, or
                destruction.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Encryption Technology
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                We use industry-standard encryption technology to protect
                sensitive information, such as credit card numbers.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Lock className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Access Controls</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Strict access controls and monitoring systems to prevent
                unauthorized access to your personal information.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <RefreshCw className="h-6 w-6 text-indigo-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Changes to This Policy
            </h2>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <p className="text-indigo-800 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the updated policy
              on our website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Regular Updates</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                We regularly review and update our privacy practices to ensure
                they remain current and effective.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <Info className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Notification Process
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                You will be notified of significant changes through our website
                and other appropriate communication channels.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Mail className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Questions & Support
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Privacy Questions
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                If you have any questions or concerns about our Privacy Policy,
                we're here to help and provide clarification.
              </p>
              <div className="text-sm text-gray-600">
                Email:{" "}
                <span className="text-blue-600">support@mycleanone.com</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Data Protection Officer
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                For specific data protection inquiries and exercising your
                privacy rights under applicable laws.
              </p>
              <div className="text-sm text-gray-600">
                Contact:{" "}
                <span className="text-blue-600">Available through support</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-sm text-gray-700">
              <strong>Effective Date:</strong> This Privacy Policy is effective
              as of June 30, 2024 and applies to all information collected by
              Paciwire Technology Pvt Ltd.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
