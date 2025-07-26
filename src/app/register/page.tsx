"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Home,
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedEula, setAcceptedEula] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!acceptedTos || !acceptedPrivacy || !acceptedEula) {
      setError(
        "You must accept the Terms of Service, Privacy Policy, and EULA to register."
      );
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(
        "Registration successful! Please check your email to set your password."
      );
      setTimeout(() => {
        // router.push("/login");
        console.log("Redirecting to login...");
      }, 2000);
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const allAgreementsAccepted = acceptedTos && acceptedPrivacy && acceptedEula;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center px-6 py-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Join Paciwire Technology and get started today
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50"
        >
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            </div>

            {/* Agreements Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Required Agreements
              </h3>

              <div className="space-y-3">
                {[
                  {
                    key: "tos",
                    state: acceptedTos,
                    setState: setAcceptedTos,
                    text: "Terms of Service",
                    href: "/legal/tos",
                  },
                  {
                    key: "privacy",
                    state: acceptedPrivacy,
                    setState: setAcceptedPrivacy,
                    text: "Privacy Policy",
                    href: "/legal/privacy",
                  },
                  {
                    key: "eula",
                    state: acceptedEula,
                    setState: setAcceptedEula,
                    text: "End User License Agreement (EULA)",
                    href: "/legal/eula",
                  },
                ].map((agreement, index) => (
                  <motion.label
                    key={agreement.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={agreement.state}
                        onChange={(e) => agreement.setState(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          agreement.state
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500"
                            : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                        }`}
                      >
                        {agreement.state && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        I agree to the{" "}
                      </span>
                      <a
                        href={agreement.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agreement.text}
                      </a>
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-300 text-sm">
                  {success}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading || !allAgreementsAccepted || !email}
              whileHover={
                !loading && allAgreementsAccepted && email
                  ? { scale: 1.02 }
                  : {}
              }
              whileTap={
                !loading && allAgreementsAccepted && email
                  ? { scale: 0.98 }
                  : {}
              }
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading || !allAgreementsAccepted || !email
                  ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Register & Get Setup Email</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 space-y-4"
        >
          <div className="text-center">
            <a
              href="/login"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Already have an account?{" "}
              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign In
              </span>
            </a>
          </div>

          <div className="text-center">
            <motion.a
              href="/marketing"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/70 backdrop-blur-sm rounded-2xl font-medium text-slate-700 dark:text-slate-300 transition-all duration-300 border border-white/20 dark:border-slate-700/50"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
