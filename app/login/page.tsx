'use client';

/**
 * Login Page
 *
 * Split-screen layout with brand panel and login form.
 * Supports customer and admin role selection.
 *
 * @module app/login/page
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Check,
  User,
  Settings,
  Package,
  Users,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ROLES } from '@/lib/permissions';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type RoleTab = 'customer' | 'admin';

interface FormErrors {
  email?: string;
  password?: string;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return undefined;
}

// ═══════════════════════════════════════════════════════════════
// TRUST BADGES COMPONENT
// ═══════════════════════════════════════════════════════════════

function TrustBadges() {
  const badges = [
    { icon: Package, value: '700+', label: 'Products' },
    { icon: Users, value: '300+', label: 'Clients' },
    { icon: Clock, value: '20+', label: 'Years' },
  ];

  return (
    <div className="flex justify-center gap-8">
      {badges.map(({ icon: Icon, value, label }) => (
        <div key={label} className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon className="w-5 h-5 text-white/70" />
            <span className="text-2xl font-bold text-white">{value}</span>
          </div>
          <span className="text-sm text-white/60">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();

  // Form state
  const [roleTab, setRoleTab] = useState<RoleTab>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const returnUrl = searchParams.get('returnUrl');
      const dashboardUrl =
        user.role === ROLES.ADMIN ? '/admin/dashboard' : '/account/dashboard';

      // Validate returnUrl is internal
      const redirectTo =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : dashboardUrl;

      router.replace(redirectTo);
    }
  }, [authLoading, isAuthenticated, user, router, searchParams]);

  // Handle field blur
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate on blur
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success && result.user) {
        // Check if role matches selected tab (optional validation)
        if (roleTab === 'admin' && result.user.role !== ROLES.ADMIN) {
          setError('This account does not have administrator access.');
          setIsSubmitting(false);
          return;
        }

        // Show success state briefly
        setShowSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirect
        const returnUrl = searchParams.get('returnUrl');
        const dashboardUrl =
          result.user.role === ROLES.ADMIN ? '/admin/dashboard' : '/account/dashboard';

        const redirectTo =
          returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : dashboardUrl;

        router.push(redirectTo);
      } else {
        setError(result.error || 'Login failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Don't show login form if already authenticated
  if (authLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#004D8B] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ═══════════════════════════════════════════════════════
          LEFT PANEL — Brand Side (hidden on mobile)
          ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#0f3460] relative overflow-hidden flex-col">
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.05) 10px,
                rgba(255,255,255,0.05) 20px
              )
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 px-12 py-12">
          {/* Logo */}
          <div className="mb-auto">
            <Image
              src="/logo-moticosolutions-white.png"
              alt="Motico Solutions"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
          </div>

          {/* Tagline */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Industrial Excellence,
              <span className="block text-red-500">Delivered.</span>
            </h2>
            <p className="text-lg text-white/60 max-w-sm">
              Your trusted partner for premium abrasives and industrial tools since 2004.
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-auto pt-8 border-t border-white/10">
            <TrustBadges />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RIGHT PANEL — Form Side
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header */}
        <div className="lg:hidden p-6 border-b border-gray-100">
          <Link href="/">
            <Image
              src="/logo-motico-solutions.png"
              alt="Motico Solutions"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[440px]">
            {/* Header */}
            <div className="mb-8">
              <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                Welcome back
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-2">
                Sign in to your account
              </h1>
              <p className="text-gray-600">
                Access your product catalog, track quotes, and manage your profile.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRoleTab('customer')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold text-sm transition-all ${
                  roleTab === 'customer'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRoleTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold text-sm transition-all ${
                  roleTab === 'admin'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            </div>

            {/* Admin warning */}
            {roleTab === 'admin' && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Admin access is for Motico Solutions staff only.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div
                  className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-fadeIn"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                    aria-label="Dismiss error"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@company.com"
                    className={`block w-full pl-12 pr-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={touched.email && !!errors.email}
                  />
                </div>
                {touched.email && errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    className={`block w-full pl-12 pr-12 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                      touched.password && errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={touched.password && !!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-600">Remember me for 30 days</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#004D8B] hover:text-[#003d6f] transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || showSuccess}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white font-semibold text-lg rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Success!
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-gray-500">or continue with</span>
                </div>
              </div>

              {/* Social Login (Stubbed) */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Coming soon"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Coming soon"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00A4EF">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              {/* Footer */}
              <div className="text-center pt-6">
                <p className="text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-[#004D8B] hover:text-[#003d6f] transition-colors"
                  >
                    Request Access →
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  By signing in you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-gray-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-gray-700">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
