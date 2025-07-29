"use client";
import React from "react";
import {
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
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Settings,
  Smartphone,
  Server,
  Building,
  MapPin,
  Calendar,
  BarChart3,
  UserCheck,
  Scale,
  Package,
} from "lucide-react";

const GeneralPrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                General Privacy Policy
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Paciwire Technologies Private Ltd - Last updated January 2023
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              About This Policy
            </h2>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              As{" "}
              <strong>
                Paciwire Technologies Unit NO 201, Second Floor Iris Tech Park,
                Sector-48, Sohna Road, Gurugram, Haryana 122001 (Mycleanone)
              </strong>{" "}
              is part of the Paciwire Group, we are joined with companies
              providing leading technology solutions in cybersecurity, privacy
              and identity protection. To enhance the functioning of your
              devices and improve your experience online, we collect your data
              to provide you with the best tools. We do not take your trust for
              granted so we've developed a Privacy Policy that covers how we
              collect, use, disclose, transfer, and store your personal data.
            </p>
          </div>
        </section>

        {/* Personal Data We Process */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Personal Data We Process
            </h2>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Important:</strong> We do NOT process special categories
                of personal data such as health, race, ethnicity or political
                opinions, nor deduce these from data we collect.
              </p>
            </div>
          </div>

          {/* Billing Data */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
              Billing Data
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Includes your name, email, masked credit card number, license
                info and (sometimes) address and phone number. When you purchase
                through a third-party or reseller, your data is processed per
                their privacy policy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <UserCheck className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  Identity Information
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Name (license owner identification)</li>
                  <li>• Email address (receipts, communication)</li>
                  <li>• Postcode and country (tax/billing)</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  Payment Information
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Masked credit card number</li>
                  <li>• Billing records</li>
                  <li>• Transaction history</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Package className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-2" />
                  License Information
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• License key (troubleshooting)</li>
                  <li>• License type (feature enablement)</li>
                  <li>• Renewability status</li>
                  <li>• Date of expiry</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product Data */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Smartphone className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
              Product Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Server className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  Device Data
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Operating system version</li>
                  <li>• Hardware specifications</li>
                  <li>• City/country location</li>
                  <li>• Error logs and diagnostics</li>
                  <li>• Browser information</li>
                  <li>• Network configuration</li>
                  <li>• Installed applications</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <BarChart3 className="h-4 w-4 text-orange-500 dark:text-orange-400 mr-2" />
                  Service Data
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Usage statistics</li>
                  <li>• User preferences</li>
                  <li>• Installed browsers</li>
                  <li>• IP address</li>
                  <li>• Feature interactions</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Note:</strong> Details differ per product. See our
                Products Policy for specific information about data collection
                for each product.
              </p>
            </div>
          </div>
        </section>

        {/* Why We Process Data */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Eye className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Why We Process Your Personal Data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Fulfillment */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Scale className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Contract Fulfillment
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Process purchases and licenses</li>
                <li>• Provision downloads and activation</li>
                <li>• Keep products updated and secure</li>
                <li>• Verify identity for support</li>
                <li>• Manage subscriptions and accounts</li>
                <li>• Provide customer/technical support</li>
              </ul>
            </div>

            {/* User Consent */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  User Consent
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Newsletter subscriptions</li>
                <li>• Personalized advertising</li>
                <li>• Third-party ads (free products)</li>
                <li>• Optional feature enhancements</li>
              </ul>
            </div>

            {/* Legal Obligations */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Scale className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Legal Obligations
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Tax and accounting compliance</li>
                <li>• Legal orders and subpoenas</li>
                <li>• Anti-money laundering checks</li>
                <li>• Sanction screening</li>
              </ul>
            </div>

            {/* Legitimate Interest */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Settings className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Legitimate Interest
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Security and performance notices</li>
                <li>• Quality evaluation and improvement</li>
                <li>• System security maintenance</li>
                <li>• Internal business management</li>
                <li>• Defending legal rights</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Your interests are considered in all processing operations. You
              have the right to object to processing based on legitimate
              interest (see "Your Privacy Rights" section).
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How Long We Store Your Personal Data
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  Billing Data
                </h4>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  As legally required
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Stored as long as legally required or needed for protecting
                legal rights
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <UserCheck className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                  Account Data
                </h4>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  While active
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Maintained while your account is active and you use our services
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <Database className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-2" />
                  Product Data
                </h4>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                  ≤6 years
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Only as needed with rolling deletion, generally 6 years or less
              </p>
            </div>
          </div>
        </section>

        {/* International Transfers */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Globe className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              International Transfers
            </h2>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              As a global company, servers may be in other countries, including
              outside the EEA. Regardless, we maintain GDPR-level protection.
              EEA data transfers are handled using Standard Contractual Clauses
              or similar legal mechanisms. This may include access by non-EEA
              personnel for storage, provisioning, payments, support, or in
              event of a merger/acquisition.
            </p>
          </div>
        </section>

        {/* Data Disclosure */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How We Disclose Your Personal Data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Payment Processors
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Authorized payment providers process your Billing Data. Their
                privacy policies apply.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Server className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Service Providers
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Contact centers, analytics providers, consultants—bound by
                confidentiality agreements.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <BarChart3 className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Advertising Partners
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                For some free products, ads are shown; SDKs may collect your
                data—with your consent.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Scale className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Legal Authorities
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Only as required by law, subpoena, court request, fraud or
                credit checks.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Your Privacy Rights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <Eye className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Information
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Know what data we collect and how we use it
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <Database className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right of Access
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Request a copy of your personal data
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <Settings className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Rectification
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Correct inaccurate or incomplete data
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <AlertTriangle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right of Erasure
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Request deletion of your data ('right to be forgotten')
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <RefreshCw className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Portability
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receive your data in a portable format
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <Shield className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Object
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Object to certain types of processing
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Withdraw Consent
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Withdraw consent for consent-based processing
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <Lock className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Restrict Processing
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Limit how we process your data
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start mb-2">
                <Scale className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  Right to Complain
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                File complaints with supervisory authorities
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              <strong>How to Exercise Your Rights:</strong> Use the Contact Us
              section below. We usually respond within one month. Note that
              unidentifiable free-software users may be unable to exercise
              certain rights.
            </p>
          </div>
        </section>

        {/* Data Protection & Security */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How We Protect Your Personal Data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-700">
              <div className="flex items-center mb-3">
                <UserCheck className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Administrative
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Access limited to authorized staff</li>
                <li>• Third-parties bound by confidentiality</li>
                <li>• Regular security training</li>
                <li>• Access logging and monitoring</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-700">
              <div className="flex items-center mb-3">
                <Server className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Technical
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Secure databases with encryption</li>
                <li>• Firewalls and intrusion detection</li>
                <li>• Antivirus and malware protection</li>
                <li>• Regular security updates</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 border border-red-200 dark:border-red-700">
              <div className="flex items-center mb-3">
                <Building className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Physical
                </h3>
              </div>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Restricted premises access</li>
                <li>• VPN for remote access</li>
                <li>• No external data removal</li>
                <li>• Secure disposal procedures</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Who We Are
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Company Information
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-200">
                        Controller
                      </p>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        Paciwire Technologies Private Ltd
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-200">
                        Address
                      </p>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        Unit NO 201, Second Floor Iris Tech Park, Sector-48,
                        Sohna Road, Gurugram, Haryana 122001
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Policy Scope
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    Applies to users of our products and services
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    Covers data collection, use, and protection
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    Part of Paciwire Group technology solutions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Mail className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Contact Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Privacy Requests & Questions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </p>
                    <a
                      href="mailto:customerservice@mycleanone.com"
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      customerservice@mycleanone.com
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      (Subject: "PRIVACY REQUEST")
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Mail Address
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Paciwire Technologies
                      <br />
                      Unit NO 201, Second Floor Iris Tech Park
                      <br />
                      Sector-48, Sohna Road, Gurugram, Haryana 122001
                      <br />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (Mark: "Attention: PRIVACY")
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Data Protection Officer
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start mb-2">
                  <Shield className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      For GDPR queries
                    </p>
                    <a
                      href="mailto:dpo@mycleanone.com"
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                    >
                      dpo@mycleanone.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Third-party Dispute Resolution
                </h4>
                <a
                  href="https://feedback-form.truste.com/watchdog/request"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  feedback-form.truste.com
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For US-based disputes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Jurisdictions */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Globe className="h-6 w-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Specific Jurisdictions
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPin className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                Russian Federation
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                  All Personal Data processing is in strict compliance with
                  Russian law. Consent is obtained; Russian citizens' data is
                  stored in Russia (with some exceptions per law). Requests or
                  revocation must be sent to us using the Contact details above.
                  This section prevails for Russian residents if contradiction
                  arises.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                California Privacy Rights
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                      Your Rights Include:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Right to know what data is collected/processed</li>
                      <li>• Right to request correction</li>
                      <li>• Right to opt out of sale/sharing</li>
                      <li>• Right to limit sensitive data use</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                      Additional Rights:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Right to deletion (unless exempt)</li>
                      <li>• Right to access (portable format)</li>
                      <li>• Right to non-discrimination</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-3">
                  We do not knowingly sell data of minors under 16. Use our "Do
                  Not Sell or Share My Personal Information" page to opt-out.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Updates */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <RefreshCw className="h-6 w-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Changes to This Policy
            </h2>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
              We reserve the right to revise or modify this Privacy Policy at
              any time. Material changes will be notified by email (to the
              address in your account), in-product, or on this website prior to
              such changes becoming effective. We encourage you to periodically
              review this page for the latest information.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GeneralPrivacyPolicy;
