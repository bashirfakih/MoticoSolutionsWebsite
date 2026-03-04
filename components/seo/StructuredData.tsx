'use client';

/**
 * Structured Data Component
 *
 * Renders JSON-LD structured data for SEO using dynamic settings
 */

import { useSettings } from '@/lib/hooks/useSettings';

export default function StructuredData() {
  const { settings } = useSettings();

  if (!settings) return null;

  const baseUrl = settings.companyWebsite || 'https://example.com';

  // Organization JSON-LD
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    description: settings.companyDescription || settings.metaDescription,
    url: baseUrl,
    logo: settings.logo ? `${baseUrl}${settings.logo}` : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.companyPhone,
      contactType: 'sales',
      email: settings.companyEmail,
    },
    address: settings.companyCity || settings.companyCountry ? {
      '@type': 'PostalAddress',
      addressLocality: settings.companyCity,
      addressCountry: settings.companyCountry,
      streetAddress: settings.companyAddress,
    } : undefined,
    sameAs: [
      settings.socialFacebook,
      settings.socialInstagram,
      settings.socialLinkedIn,
      settings.socialYouTube,
      settings.socialTwitter,
      settings.socialTikTok,
    ].filter(Boolean),
  };

  // Website JSON-LD
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.companyName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
