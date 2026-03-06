/**
 * Users API Route
 *
 * GET /api/users - List all users (admin only)
 * POST /api/users - Create new user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { Prisma } from '@prisma/client';

// GET - List users with optional filtering (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filtering
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const isActive = searchParams.get('isActive');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role as 'admin' | 'customer';
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated results
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: true,
        phone: true,
        avatar: true,
        isActive: true,
        country: true,
        industry: true,
        position: true,
        discountPercentage: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: users.map(user => ({
        ...user,
        discountPercentage: Number(user.discountPercentage),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Validate discount percentage if provided
    if (body.discountPercentage !== undefined) {
      const discount = Number(body.discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: 'Discount percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        role: body.role || 'customer',
        company: body.company || null,
        phone: body.phone || null,
        country: body.country || null,
        industry: body.industry || null,
        position: body.position || null,
        address: body.address || null,
        city: body.city || null,
        isActive: body.isActive ?? true,
        discountPercentage: body.discountPercentage ?? 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: true,
        phone: true,
        isActive: true,
        country: true,
        industry: true,
        position: true,
        discountPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ...user,
      discountPercentage: Number(user.discountPercentage),
    }, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
