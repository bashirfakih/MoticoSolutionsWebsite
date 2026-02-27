'use client';

/**
 * Forgot Password Page for Motico Solutions
 *
 * Simple password reset request flow.
 * Currently mock - displays success message without sending email.
 *
 * @module app/forgot-password/page
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ═══════════════════════════════════════════════════════════════
// MOCK PASSWORD RESET
// ═══════════════════════════════════════════════════════════════

/**
 * Mock password reset request
 * In production, replace with actual API call
 */
async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In mock mode, always succeed if email is valid
  if (!validateEmail(email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  // Mock success
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent password reset instructions to:
            </p>
            <p className="font-semibold text-gray-900 mb-6">{email}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                <strong>Didn&apos;t receive the email?</strong>
                <br />
                Check your spam folder, or{' '}
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="text-[#004D8B] font-semibold hover:underline"
                >
                  try another email address
                </button>
                .
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#004D8B] text-white font-semibold rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-[#004D8B] to-[#002d52] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/slide-1.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <Image
              src="/logo-motico-solutions.png"
              alt="Motico Solutions"
              width={180}
              height={54}
              className="h-16 w-auto brightness-0 invert"
            />
          </Link>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Reset Your Password
            </h1>
            <p className="text-blue-100 text-lg max-w-sm">
              No worries! Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          {/* Footer */}
          <p className="text-blue-200/60 text-sm">
            Industrial Abrasives & Tools — Beirut, Lebanon
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-motico-solutions.png"
              alt="Motico Solutions"
              width={140}
              height={42}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Back Link */}
        <div className="p-6 lg:p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      error
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                    } focus:outline-none focus:ring-2 transition-colors text-sm`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#004D8B] text-white font-semibold rounded-lg hover:bg-[#003a6a] focus:outline-none focus:ring-2 focus:ring-[#004D8B] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to Login */}
              <p className="text-center text-sm text-gray-600 pt-4">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#004D8B] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact us at{' '}
                <a
                  href="mailto:info@moticosolutions.com"
                  className="text-[#004D8B] hover:underline"
                >
                  info@moticosolutions.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
