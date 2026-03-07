/**
 * Next.js Instrumentation
 *
 * Runs once when the server starts. Used for environment validation
 * and other startup checks.
 */

export async function register() {
  // Only run on the server (not edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/security/env');
    validateEnv();
  }
}
