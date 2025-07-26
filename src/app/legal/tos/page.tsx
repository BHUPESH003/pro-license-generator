"use client";
import React from "react";
import { motion } from "framer-motion";

export default function TermsAndConditionsPage() {
  const sections = [
    {
      id: "license",
      title: "License",
      icon: "📜",
      color: "from-blue-500 to-cyan-500",
      content:
        "Paciwire Technology Pvt Ltd grants you a non-exclusive, non-transferable, limited license to use our software products for personal or commercial use. This license is subject to your compliance with these terms and conditions.",
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: "🧠",
      color: "from-purple-500 to-pink-500",
      content:
        "All intellectual property rights in our software and website, including but not limited to copyrights, trademarks, and trade secrets, belong to Paciwire Technology Pvt Ltd. You may not reproduce, distribute, modify, or create derivative works based on our software or website without our prior written consent.",
    },
    {
      id: "disclaimer",
      title: "Disclaimer of Warranties",
      icon: "⚠️",
      color: "from-orange-500 to-red-500",
      content:
        'Our software and website are provided "as is" and without warranties of any kind, express or implied. We do not warrant that our software or website will meet your requirements, be error-free, or be free from viruses or other harmful components.',
      important:
        'Our software and website are provided "as is" without any warranties.',
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: "🛡️",
      color: "from-red-500 to-pink-500",
      content:
        "Paciwire Technology Pvt Ltd shall not be liable for any damages, including but not limited to direct, indirect, incidental, special, or consequential damages, arising out of or in connection with the use of our software or website.",
    },
    {
      id: "termination",
      title: "Termination",
      icon: "🚪",
      color: "from-green-500 to-emerald-500",
      content:
        "We may terminate your license to use our software or website at any time, with or without cause. Upon termination, you must immediately cease all use of our software and website.",
    },
    {
      id: "governing-law",
      title: "Governing Law",
      icon: "⚖️",
      color: "from-indigo-500 to-purple-500",
      content:
        "These terms and conditions shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these terms and conditions shall be resolved through arbitration in accordance with the rules of the Indian Arbitration and Conciliation Act.",
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      icon: "🔄",
      color: "from-teal-500 to-blue-500",
      content:
        "We reserve the right to modify these terms and conditions at any time, without notice. Your continued use of our software and website after such modifications shall constitute your acceptance of the modified terms and conditions.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Rules and regulations for using Paciwire Technology Pvt Ltd's
            website and software products
          </p>
        </motion.div>

        {/* Introduction Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-12 shadow-xl border border-white/20 dark:border-slate-700/50"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Welcome to Paciwire Technology Pvt Ltd!
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                These terms and conditions outline the rules and regulations for
                the use of our website and software products. By accessing our
                website or using our software, you accept these terms and
                conditions in full.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-2xl">{section.icon}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {section.title}
                  </h3>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                {section.content}
              </p>

              {section.important && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-lg">
                      ⚠️
                    </span>
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      {section.important}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              If you have any questions or concerns about our terms and
              conditions, we're here to help.
            </p>
            <motion.a
              href="mailto:support@mycleanone.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-4 rounded-2xl font-semibold transition-all duration-300 border border-white/30"
            >
              <span className="text-xl">✉️</span>
              <span>support@mycleanone.com</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12 pt-8 border-t border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-500 dark:text-slate-400">
            <strong>Last updated:</strong> June 30, 2024
          </p>
        </motion.div>
      </div>
    </div>
  );
}
