'use server';

/**
 * Export Server Actions
 *
 * Fetches full datasets (bypassing pagination) for CSV export.
 *
 * @module lib/actions/export
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function exportOrders(filters: { status?: string; search?: string }) {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status && filters.status !== 'all' && filters.status !== '') {
    where.status = filters.status as Prisma.EnumOrderStatusFilter;
  }

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      { customerName: { contains: filters.search, mode: 'insensitive' } },
      { customerEmail: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(o => ({
    'Order #': o.orderNumber,
    'Customer': o.customerName,
    'Email': o.customerEmail,
    'Status': o.status,
    'Payment': o.paymentStatus,
    'Items': o.itemCount,
    'Subtotal': Number(o.subtotal),
    'Shipping': Number(o.shippingCost),
    'Tax': Number(o.tax),
    'Discount': Number(o.discount),
    'Total': Number(o.total),
    'Currency': o.currency,
    'Date': o.createdAt.toISOString(),
  }));
}

export async function exportProducts(filters: { search?: string; stockStatus?: string; categoryId?: string; brandId?: string }) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.stockStatus && filters.stockStatus !== 'all' && filters.stockStatus !== '') {
    where.stockStatus = filters.stockStatus as Prisma.EnumStockStatusFilter;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.brandId) {
    where.brandId = filters.brandId;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });

  return products.map(p => ({
    'SKU': p.sku,
    'Name': p.name,
    'Category': p.category?.name ?? '',
    'Brand': p.brand?.name ?? '',
    'Price': p.price ? Number(p.price) : '',
    'Stock Qty': p.stockQuantity,
    'Stock Status': p.stockStatus,
    'Min Stock Level': p.minStockLevel,
    'Published': p.isPublished ? 'Yes' : 'No',
    'Featured': p.isFeatured ? 'Yes' : 'No',
    'Created': p.createdAt.toISOString(),
  }));
}

export async function exportCustomers(filters: { search?: string; status?: string }) {
  const where: Prisma.CustomerWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.status && filters.status !== 'all' && filters.status !== '') {
    where.status = filters.status as Prisma.EnumCustomerStatusFilter;
  }

  const customers = await prisma.customer.findMany({
    where,
    include: { _count: { select: { orders: true } } },
    orderBy: { name: 'asc' },
  });

  return customers.map(c => ({
    'Name': c.name,
    'Email': c.email,
    'Company': c.company ?? '',
    'Phone': c.phone ?? '',
    'City': c.city ?? '',
    'Country': c.country,
    'Orders': c._count.orders,
    'Total Spent': Number(c.totalSpent),
    'Discount %': Number(c.discountPercentage),
    'Status': c.status,
    'Verified': c.isVerified ? 'Yes' : 'No',
    'Joined': c.createdAt.toISOString(),
  }));
}
