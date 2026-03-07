/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set at server startup.
 * Fails loudly with a clear error message if any are missing, preventing
 * the application from running in an insecure state.
 *
 * Import this module in the root layout or API bootstrap to trigger validation.
 *
 * @module lib/security/env
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
] as const;

const REQUIRED_IN_PRODUCTION = [
  'NEXT_PUBLIC_APP_URL',
] as const;

/**
 * Validate that required environment variables are set.
 * Throws an error if any are missing.
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    // Warn if AUTH_SECRET looks like a development placeholder
    const authSecret = process.env.AUTH_SECRET || '';
    if (
      authSecret.includes('change-in-production') ||
      authSecret.includes('dev-secret') ||
      authSecret.length < 32
    ) {
      console.error(
        '[SECURITY] AUTH_SECRET appears to be a development placeholder. ' +
        'Generate a secure secret with: openssl rand -base64 32'
      );
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[SECURITY] Missing required environment variables: ${missing.join(', ')}. ` +
      'Check your .env file or environment configuration.'
    );
  }
}
