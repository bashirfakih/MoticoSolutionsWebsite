'use client';

/**
 * Registration Page for Motico Solutions
 *
 * Split-screen layout matching the login page design.
 * Customer registration with comprehensive form validation.
 *
 * @module app/register/page
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  User,
  Phone,
  Globe,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const COUNTRIES = [
  'Lebanon',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Jordan',
  'Iraq',
  'Egypt',
  'Other',
];

const INDUSTRIES = [
  'Automotive',
  'Aerospace',
  'Metal Fabrication',
  'Woodworking',
  'Construction',
  'Marine',
  'General Manufacturing',
  'Maintenance & Repair',
  'Other',
];

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  country?: string;
  industry?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  // Allow various phone formats
  const phoneRegex = /^[\d\s\-+()]{8,}$/;
  return phone === '' || phoneRegex.test(phone);
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;

  if (passedChecks <= 1) {
    return { score: 1, label: 'Weak', color: '#dc2626', checks };
  } else if (passedChecks === 2) {
    return { score: 2, label: 'Fair', color: '#f97316', checks };
  } else if (passedChecks === 3) {
    return { score: 3, label: 'Good', color: '#eab308', checks };
  } else if (passedChecks === 4) {
    return { score: 4, label: 'Strong', color: '#22c55e', checks };
  } else {
    return { score: 5, label: 'Very Strong', color: '#16a34a', checks };
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    industry: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength
  const passwordStrength = calculatePasswordStrength(formData.password);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const returnUrl = searchParams.get('returnUrl') || '/account/dashboard';
      router.push(returnUrl);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setSubmitError(null);

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  // Validate individual field
  const validateField = (name: string): boolean => {
    let error: string | undefined;

    switch (name) {
      case 'firstName':
        if (!formData.firstName.trim()) {
          error = 'First name is required';
        }
        break;
      case 'lastName':
        if (!formData.lastName.trim()) {
          error = 'Last name is required';
        }
        break;
      case 'company':
        if (!formData.company.trim()) {
          error = 'Company name is required';
        }
        break;
      case 'email':
        if (!formData.email) {
          error = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!validatePhone(formData.phone)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'country':
        if (!formData.country) {
          error = 'Please select your country';
        }
        break;
      case 'industry':
        if (!formData.industry) {
          error = 'Please select your industry';
        }
        break;
      case 'password':
        if (!formData.password) {
          error = 'Password is required';
        } else if (formData.password.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (passwordStrength.score < 3) {
          error = 'Password is too weak';
        }
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          error = 'Please confirm your password';
        } else if (formData.confirmPassword !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'agreeTerms':
        if (!formData.agreeTerms) {
          error = 'You must agree to the terms and conditions';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const fields = [
      'firstName',
      'lastName',
      'company',
      'email',
      'country',
      'industry',
      'password',
      'confirmPassword',
      'agreeTerms',
    ];

    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
      setTouched(prev => ({ ...prev, [field]: true }));
    });

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
        industry: formData.industry || undefined,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#004D8B] animate-spin" />
      </div>
    );
  }

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
              Registration Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for registering with Motico Solutions. Your account is now pending review.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong><br />
                Our team will review your application within 24 hours. Once approved, you&apos;ll receive an email confirmation and can log in to access exclusive B2B pricing and place orders.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#004D8B] text-white font-semibold rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              Go to Login
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
            <h1 className="text-4xl font-bold text-white mb-4">
              Join Motico Solutions
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-sm">
              Create your B2B account to access exclusive wholesale pricing, place orders, and manage your industrial supply needs.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                'Access exclusive B2B pricing',
                'Track orders and shipments',
                'Manage quotes and invoices',
                'Direct line to technical support',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>
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
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#004D8B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-start justify-center px-6 pb-12 overflow-y-auto">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Fill in your details to register for a B2B account.
              </p>
            </div>

            {/* Review Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Account Review Required
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    All new accounts are reviewed within 24 hours before activation. You&apos;ll receive an email once approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        touched.firstName && errors.firstName
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                      } focus:outline-none focus:ring-2 transition-colors text-sm`}
                    />
                  </div>
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Doe"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        touched.lastName && errors.lastName
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                      } focus:outline-none focus:ring-2 transition-colors text-sm`}
                    />
                  </div>
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your Company Ltd."
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      touched.company && errors.company
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                    } focus:outline-none focus:ring-2 transition-colors text-sm`}
                  />
                </div>
                {touched.company && errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Business Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@company.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      touched.email && errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                    } focus:outline-none focus:ring-2 transition-colors text-sm`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone & Country Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+961 X XXX XXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        touched.phone && errors.phone
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                      } focus:outline-none focus:ring-2 transition-colors text-sm`}
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none bg-white ${
                        touched.country && errors.country
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                      } focus:outline-none focus:ring-2 transition-colors text-sm`}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  {touched.country && errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Industry <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none bg-white ${
                      touched.industry && errors.industry
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                    } focus:outline-none focus:ring-2 transition-colors text-sm`}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
                {touched.industry && errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a strong password"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      touched.password && errors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                    } focus:outline-none focus:ring-2 transition-colors text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    {/* Strength Bar */}
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className="h-1.5 flex-1 rounded-full transition-colors"
                          style={{
                            backgroundColor:
                              level <= passwordStrength.score
                                ? passwordStrength.color
                                : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </p>

                    {/* Requirements Checklist */}
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {[
                        { key: 'length', label: '8+ characters' },
                        { key: 'uppercase', label: 'Uppercase letter' },
                        { key: 'lowercase', label: 'Lowercase letter' },
                        { key: 'number', label: 'Number' },
                        { key: 'special', label: 'Special character' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1.5">
                          {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          <span
                            className={`text-xs ${
                              passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {touched.password && errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : formData.confirmPassword && formData.confirmPassword === formData.password
                        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-[#004D8B] focus:border-[#004D8B]'
                    } focus:outline-none focus:ring-2 transition-colors text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword &&
                  formData.confirmPassword === formData.password && (
                    <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Passwords match
                    </p>
                  )}
              </div>

              {/* Agreements */}
              <div className="space-y-3 pt-2">
                {/* Terms Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#004D8B] hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#004D8B] hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {touched.agreeTerms && errors.agreeTerms && (
                  <p className="text-sm text-red-600 ml-7">{errors.agreeTerms}</p>
                )}

                {/* Marketing Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#004D8B] focus:ring-[#004D8B]"
                  />
                  <span className="text-sm text-gray-600">
                    I would like to receive product updates, promotions, and industry news via email
                  </span>
                </label>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600 pt-4">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#004D8B] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
