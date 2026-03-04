/**
 * Register API Route - Disabled
 *
 * POST /api/auth/register
 * Self-registration is disabled. Users must be created by admins.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Self-registration is disabled. Please contact an administrator to create an account.' },
    { status: 403 }
  );
}
