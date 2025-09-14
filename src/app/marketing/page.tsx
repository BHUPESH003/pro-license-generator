"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import apiClient from "@/lib/axios";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

interface AppVersion {
  version: string;
  url: string;
}

function detectOS() {
  if (typeof window === "undefined") return null;
  const { userAgent } = window.navigator;
  if (/Windows/i.test(userAgent)) return "Windows";
  return null;
}

export default function MarketingLandingPage() {
  const [loading, setLoading] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [appVersion, setAppVersion] = useState<AppVersion | null>(null);
  const [versionLoading, setVersionLoading] = useState(true);
  const router = useRouter();

  // Fetch app version on component mount
  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        setVersionLoading(true);
        const versionRes = await apiClient.get('/api/app-version');
        if (versionRes.data.success) {
          setAppVersion(versionRes.data.data);
        } else {
          // Use fallback data from API response
          setAppVersion(versionRes.data.data);
        }
      } catch (fetchError) {
        console.error('Failed to fetch app version:', fetchError);
        // Fallback version - use direct S3 URL for download
        setAppVersion({
          version: "1.1.0",
          url: 'https://pocpmli.s3.ap-south-1.amazonaws.com/mycleanone/MyCleanOnSetup.msi'
        });
      } finally {
        setVersionLoading(false);
      }
    };

    fetchAppVersion();
  }, []);

  const handleBuyPro = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post("/api/stripe/create-checkout-session", {
        plan: "pro",
      });
      window.location.href = res.data.url;
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Use the fetched app version if available, otherwise fallback
    if (appVersion?.url) {
      const anchor = document.createElement("a");
      anchor.href = appVersion.url;
      anchor.download = "";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } else {
      // Fallback to default URL if version not loaded yet
      const anchor = document.createElement("a");
      anchor.href = 'https://pocpmli.s3.ap-south-1.amazonaws.com/mycleanone/MyCleanOnSetup.msi';
      anchor.download = "";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    setIsDownloadModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-4 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        className="max-w-4xl text-center mb-20"
        variants={itemVariants}
      >
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Modern Software Licensing Made Simple
        </motion.h1>
        <motion.p
          className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Secure, scalable, and user-friendly licensing, authentication, and
          payments for your SaaS or downloadable software.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/register">
              <Button
                // variant="accent"
                size="lg"
                className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-700"
              >
                Start Free Trial
              </Button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-700"
              >
                Login
              </Button>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-700"
              onClick={handleDownload}
              disabled={versionLoading}
            >
              {versionLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                `Download v${appVersion?.version || "1.1.0"}`
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        variants={itemVariants}
      >
        <motion.div
          className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 group"
          variants={cardVariants}
          whileHover={{ y: -10, scale: 1.02 }}
        >
          <motion.div
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: 5 }}
          >
            <Icon name="lock" size={40} className="text-white" />
          </motion.div>
          <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
            Secure Authentication
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            Robust email-based onboarding, password reset, and JWT-protected
            dashboard.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 group"
          variants={cardVariants}
          whileHover={{ y: -10, scale: 1.02 }}
        >
          <motion.div
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: -5 }}
          >
            <Icon name="user" size={40} className="text-white" />
          </motion.div>
          <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
            Easy License Management
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            Automated license key generation, device management, and user
            dashboard.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 group"
          variants={cardVariants}
          whileHover={{ y: -10, scale: 1.02 }}
        >
          <motion.div
            className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-4 group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: 5 }}
          >
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-white"
            >
              <rect x="6" y="14" width="20" height="12" rx="2" />
              <path d="M12 14V10a4 4 0 0 1 8 0v4" />
            </svg>
          </motion.div>
          <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
            Stripe Payments
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            Seamless, secure checkout and instant license delivery with Stripe
            integration.
          </p>
        </motion.div>
      </motion.section>

      {/* Use Cases Section */}
      <motion.section
        className="max-w-6xl w-full mb-20"
        variants={itemVariants}
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Use Cases & Industry Applications
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            {
              title: "SaaS Platforms",
              description:
                "Manage user subscriptions, trial periods, and secure access to your cloud-based software.",
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Downloadable Software",
              description:
                "Distribute license keys, control activations, and protect your desktop or mobile apps.",
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "Agencies & Consultancies",
              description:
                "Offer client-specific licensing, device management, and easy onboarding for B2B solutions.",
              color: "from-green-500 to-green-600",
            },
            {
              title: "Indie Developers",
              description:
                "Monetize your side projects with secure payments and instant license delivery.",
              color: "from-orange-500 to-orange-600",
            },
          ].map((useCase, index) => (
            <motion.div
              key={useCase.title}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 group"
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <div
                className={`w-12 h-1 bg-gradient-to-r ${useCase.color} rounded-full mb-4 group-hover:w-16 transition-all duration-300`}
              />
              <h4 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
                {useCase.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        className="max-w-5xl w-full mb-20"
        variants={itemVariants}
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Pricing
        </motion.h2>
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          {[
            {
              title: "Monthly",
              price: "$19",
              period: "/mo",
              // features: ["Email-based authentication", "Basic dashboard"],
              border: "border-slate-200 dark:border-slate-700",
              popular: false,
            },
            {
              title: "Quarterly",
              price: "$49",
              period: "/qtr",
              // features: ["Email-based authentication", "Basic dashboard"],
              border: "border-2 border-purple-500",
              popular: true,
            },
            {
              title: "Yearly",
              price: "$179",
              period: "/yr",
              // features: ["Email-based authentication", "Basic dashboard"],
              border: "border-2 border-blue-500",
              popular: false,
            },
          ].map((plan, index) => (
            <motion.div
              key={plan.title}
              className={`flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl ${plan.border} transition-all duration-300 relative group`}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  Most Popular
                </motion.div>
              )}
              <h3 className="font-bold text-2xl mb-3 text-slate-900 dark:text-white">
                {plan.title}
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-xl text-slate-600 dark:text-slate-300">
                  {plan.period}
                </span>
              </div>
              {/* <ul className="text-slate-600 dark:text-slate-300 text-base mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul> */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <a href="/dashboard/licenses">
                  <Button
                    size="lg"
                    className="w-full text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="max-w-5xl w-full mb-20"
        variants={itemVariants}
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          What Our Users Say
        </motion.h2>
        <div className="flex flex-col sm:flex-row gap-8">
          {[
            {
              quote:
                "The onboarding was seamless and the dashboard is super intuitive!",
              author: "SaaS Founder",
            },
            {
              quote:
                "Stripe payments and license delivery just work. Highly recommended.",
              author: "Indie Developer",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300"
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <div className="text-4xl text-slate-300 dark:text-slate-600 mb-4">
                "
              </div>
              <p className="italic text-lg mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                {testimonial.quote}
              </p>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                — {testimonial.author}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="text-center mb-12" variants={itemVariants}>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/register">
            <Button
              // variant="accent"
              size="lg"
              className="text-xl px-10 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 bg-purple-700"
            >
              Get Started Today
            </Button>
          </Link>
        </motion.div>
      </motion.section>
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      >
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            Thanks for downloading!
          </div>
          <div className="text-slate-700 dark:text-slate-300">
            MyCleanOne v{appVersion?.version || "1.1.0"} is now downloading.
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">
            You haven't purchased a license yet. Please login to continue.
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push("/login")}
              className="px-6"
            >
              Go to Login
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsDownloadModalOpen(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
