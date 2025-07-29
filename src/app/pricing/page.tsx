"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function PricingPage() {
  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: 19,
      period: "mo",
      description: "Perfect for getting started",
      features: [
        "Up to 10 devices",
        "Email-based authentication",
        "Basic dashboard",
        "24/7 support",
        "Basic analytics",
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: 49,
      period: "qtr",
      description: "Most popular choice",
      features: [
        "Up to 25 devices",
        "Email-based authentication",
        "Advanced dashboard",
        "Priority support",
        "Advanced analytics",
        "API access",
      ],
      popular: true,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 179,
      period: "yr",
      description: "Best value for teams",
      features: [
        "Unlimited devices",
        "Email-based authentication",
        "Premium dashboard",
        "Dedicated support",
        "Full analytics suite",
        "API access",
        "Custom integrations",
      ],
      popular: false,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade anytime?",
      answer:
        "Yes, you can change your plan at any time from your dashboard. Changes take effect immediately.",
    },
    {
      question: "Is there a free trial for Pro?",
      answer:
        "Yes, you can try Pro features for 14 days before being charged. No credit card required.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express) via Stripe.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Absolutely! You can cancel your subscription at any time from your dashboard with no questions asked.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for all new subscriptions.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full bg-repeat bg-[length:60px_60px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl shadow-blue-500/25">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. Upgrade or downgrade anytime
            with no hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border transition-all duration-300 flex flex-col h-full ${
                plan.popular
                  ? "border-purple-300 ring-2 ring-purple-500/20 shadow-purple-500/20"
                  : "border-white/20 dark:border-slate-700/50 hover:border-blue-300/60"
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-center mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <span className="text-2xl text-white">
                    {plan.id === "monthly"
                      ? "📅"
                      : plan.id === "quarterly"
                      ? "📊"
                      : "🏆"}
                  </span>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-lg">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + featureIndex * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div
                      className={`w-5 h-5 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-auto"
              >
                <Link href="/dashboard/downloads" className="block">
                  <Button
                    size="md"
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : ""
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-blue-500/25">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of developers who trust our platform for their
                software licensing needs.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
