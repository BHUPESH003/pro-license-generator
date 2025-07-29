"use client";
import React from "react";
import {
  Package,
  Shield,
  Monitor,
  Settings,
  Trash2,
  Zap,
  HardDrive,
  Download,
  Users,
  Clock,
  Globe,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Calendar,
  MapPin,
  Eye,
  BarChart3,
  Smartphone,
} from "lucide-react";

const ProductsPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Products Policy
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                MyCleanOne - Last updated July 2022
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Overview */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Monitor className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              MyCleanOne for Windows
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Official Product Names
              </h3>
              <div className="space-y-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <span className="text-blue-900 dark:text-blue-200 font-medium">
                    MyCleanone Free
                  </span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <span className="text-blue-900 dark:text-blue-200 font-medium">
                    MyCleanone Professional
                  </span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <span className="text-blue-900 dark:text-blue-200 font-medium">
                    MyCleanone Business Edition
                  </span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <span className="text-blue-900 dark:text-blue-200 font-medium">
                    MyCleanone Technician Edition
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                (collectively as "MyCleanone for Windows")
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Core Functionality
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 leading-relaxed">
                  MyCleanone for Windows is a safe and trusted PC utility that
                  speeds up and cleans your PC, applies updates, securely wipes
                  data and solves other computer problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Product's Main Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Custom Clean */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Custom Clean
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Cleans your browser history, cached images, cookies including
                both first-party and third-party cookies, and other junk with
                just one click, to keep your activity private and free up disk
                space.
              </p>
            </div>

            {/* Health Check */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Health Check
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Cleans your browser history, cached images, cookies including
                both first-party and third-party cookies, and other junk, to
                keep your activity private and free up disk space. Also
                conveniently updates third-party applications, and disables
                unnecessary startup items to reduce the time taken to start your
                PC.
              </p>
            </div>

            {/* Performance Optimizer */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Performance Optimizer
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Allows you to optimize your PC's performance by safely placing
                apps into 'sleep mode' so they do not use system resources after
                they have been closed down.
              </p>
            </div>

            {/* Driver Updater */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Cpu className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Driver Updater
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Provides an overview of your drivers and transmits authentic
                updates securely to your device to maintain the components that
                manage your sound, visuals, internet connection, and basic
                hardware like your mouse and keyboard.
              </p>
            </div>

            {/* Software Updater */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Download className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Software Updater
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Conveniently updates third-party applications in a batch
                process.
              </p>
            </div>

            {/* Apps Uninstaller */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Package className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Apps Uninstaller
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Permits uninstallation of all applications on the PC, including
                those that Windows typically won't allow you to.
              </p>
            </div>

            {/* Startup Manager */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Clock className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Startup Manager
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Allows management of items that run at Windows startup.
              </p>
            </div>

            {/* Browser Plugin Manager */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Browser Plugin Manager
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Facilitates management of plugins from all browsers from a
                single interface.
              </p>
            </div>

            {/* Disk Analyzer */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <BarChart3 className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Disk Analyzer
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Analyzes your disk internal and external drives to provide
                insights on disk usage by file type.
              </p>
            </div>

            {/* Drive Wiper */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <HardDrive className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Drive Wiper
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Allows secure deletion of files on an internal or external
                drive, making original file content practically irretrievable.
              </p>
            </div>

            {/* Smart Clean */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Eye className="h-5 w-5 text-teal-500 dark:text-teal-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Smart Clean
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Provides contextual triggers for cleaning and cleaning alerts
                allowing, for example, designated browsers to be cleaned every
                time they are closed.
              </p>
            </div>

            {/* Scheduled Cleaning */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Scheduled Cleaning
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Allows cleaning to be run automatically according to a specified
                frequency.
              </p>
            </div>
          </div>
        </section>

        {/* Personal Data Processing */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-purple-500 dark:text-purple-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Personal Data We Process
            </h2>
          </div>

          {/* PC Cleaning Features */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              When Using PC Cleaning Features
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                <strong>Features:</strong> Custom Clean, Health Check 'Junk' and
                'Privacy' sections, Scheduled Cleaning, Smart Clean, Drive
                Wiper, Registry Cleaner, Disk Analyzer
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Important:</strong> This data is processed on your
                  device and is not sent to our environment. Furthermore,
                  MyCleanone does not read the contents of files or databases
                  because it does not need to. It just deletes the file or wipes
                  all or part of a database.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Browser Data
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Form data (name, surname, email, passwords)</li>
                  <li>
                    • Cookies from websites you visit (first and third-party)
                  </li>
                  <li>• Download records</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  System Data
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Installed browsers and plugins</li>
                  <li>• Files on the device</li>
                  <li>• Windows User profile names</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Web & Registry Data
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Web domains from cookies</li>
                  <li>• User-defined web domain rules</li>
                  <li>• Windows system Registry entries</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Application Management Features */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              When Using Application Management Features
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
              <p className="text-green-800 dark:text-green-200 text-sm mb-2">
                <strong>Features:</strong> Health Check 'Speed' section,
                Uninstaller, Startup Manager, Browser Plugin Manager
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Important:</strong> This data is processed on your
                  device and is not sent to our environment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Browser Information
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Installed browsers and browser plugins
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Applications
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Installed applications
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  System Services
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Startup items/services and scheduled tasks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service and Device Data */}
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-sm p-6 mb-8 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-red-500 dark:text-red-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Service and Device Data Collection
            </h2>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Note:</strong> While using MyCleanone for Windows, we
              collect and process the following Service and Device Data (in
              addition to Billing Data for paid version) in our environment:
            </p>
          </div>

          {/* Service Data */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
              Service Data
            </h3>

            <div className="space-y-4">
              {/* IP Address */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    IP Address
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> To detect the
                      approximate location of fraudulent use of the product. At
                      activation, the IP address is replaced with a city/country
                      code.
                    </span>
                  </div>
                </div>
              </div>

              {/* Identifier of Content Being Delivered */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Identifier of Content Being Delivered
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> To monitor service
                      functionality
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users of problems that will not be solved by the
                      currently installed product and to offer users a solution
                      to the detected problem
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      monitor messaging performance
                    </span>
                  </div>
                </div>
              </div>

              {/* Events and Product Usage */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Events and Product Usage
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> To ensure continuous
                      functionality (installations, versions, updates, settings)
                      and map how users interact with our product
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users of problems that will not be solved by the
                      currently installed product and to offer users a solution
                      to the detected problem
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      better understand our users' behavior and introduce a new
                      feature or product based on previous experience
                    </span>
                  </div>
                </div>
              </div>

              {/* Number of Application Launches */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Number of Application Launches
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> For product
                      maintenance and customer support
                    </span>
                  </div>
                </div>
              </div>

              {/* License Key */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    License Key
                  </h4>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                    36 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> We send back the
                      license key through the application for regulating access
                      to the product, providing customer support, and
                      administering product updates
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Product Settings
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> We send back the
                      status of various settings and user preferences so we can
                      adapt functionality to a user's requests and effectively
                      maintain our infrastructure
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users about functionality or products that are
                      relevant to them
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      better understand how users' interact with certain aspects
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Data */}
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Smartphone className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
              Device Data
            </h3>

            <div className="space-y-4">
              {/* Internal Online Identifiers */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Internal Online Identifiers (GUID, Device ID)
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> For ensuring
                      continuous functionality and breaking down entries in
                      databases
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users of problems that will not be solved by the
                      currently installed product and to offer users a solution
                      to the detected problem
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      better understand our users' behavior and introduce a new
                      feature or product based on previous experience
                    </span>
                  </div>
                </div>
              </div>

              {/* OS Version */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    OS Version
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> For making sure the
                      product functionality is compatible with the system, user
                      support, troubleshooting, and product development planning
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> When
                      developing new features, we adjust the scope of the
                      feature based upon the requirements and the functionality
                      of certain operating systems. To better understand how
                      users' interact with certain aspects
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Location
                  </h4>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                    12 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> To set up a proper
                      product language version for Windows and to segment
                      updates by location
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users of problems that will not be solved by the
                      currently installed product and to offer users a solution
                      to the detected problem
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      better understand users' behavior based on approximate
                      location and to introduce a new feature or product based
                      on approximate location
                    </span>
                  </div>
                </div>
              </div>

              {/* MyCleanone Version */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    MyCleanone Version
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> For user support,
                      troubleshooting, and product development planning
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users of problems that will not be solved by the
                      currently installed product and to offer users a solution
                      to the detected problem
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      better understand how users' interact with certain aspects
                    </span>
                  </div>
                </div>
              </div>

              {/* Install Date or Time */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Install Date or Time
                  </h4>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                    36 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> For license management
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>In-product Messaging (6 months):</strong> To
                      inform users of problems that will not be solved by the
                      currently installed product and to offer users a solution
                      to the detected problem
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To know
                      when to market new features and or products
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Data */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Hardware Data (device model, RAM, GPU, CPU)
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> To install the
                      product, provide application updates, administer
                      compatibility safeguards, customer support and make user
                      experience improvements
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      To check for compatibility issues in automated crash dumps
                      so we can ensure continuous functionality
                    </span>
                  </div>
                </div>
              </div>

              {/* Windows Language and Locale */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Windows Language and Locale
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Service Provision:</strong> To configure the
                      product interface to be understandable and usable
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>
                      <strong>Product and Business Improvement:</strong> To
                      better understand our users' behavior
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Concerning Applications on Device */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Information Concerning Applications on the Device (names and
                    background processes)
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    To display this information to the user, to assess
                    performance impact of applications, and to monitor service
                    functionality and make it more reliable.
                  </p>
                </div>
              </div>

              {/* Information Concerning Drivers */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Information Concerning Drivers (driver version, update date,
                    name, matching device id, driver rank, driver flags)
                  </h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    24 months
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    To display this information to the user, to suggest driver
                    updates when appropriate, and to monitor service
                    functionality and make it more reliable.
                  </p>
                </div>
              </div>

              {/* Security Apps / Antivirus on Device */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Security apps / antiviruses on the device
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  For promoting products or services that are relevant to the
                  user.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  This data is used only for{" "}
                  <strong>In-product Messaging (6 months)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Third-party analytics */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Third-party Analytics Tools
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We use the following third-party analytics tools for MyCleanone
              for Windows:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-2">
              <li>Google Analytics</li>
              <li>Logentries</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              For further information regarding our third-party analytics
              partners, including their privacy policies, please refer to our{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                General Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductsPolicy;
