/**
 * Current User API Route
 *
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Convert Decimal to number for JSON serialization
    return NextResponse.json({
      user: {
        ...user,
        discountPercentage: user.discountPercentage ? Number(user.discountPercentage) : 0,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
