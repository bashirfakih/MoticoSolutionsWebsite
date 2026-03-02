/**
 * Inventory Alerts API Route
 *
 * GET /api/inventory/alerts - Get low stock and out of stock products
 * POST /api/inventory/alerts/notify - Send alert notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export interface InventoryAlert {
  id: string;
  sku: string;
  name: string;
  slug: string;
  stockQuantity: number;
  minStockLevel: number;
  stockStatus: string;
  severity: 'critical' | 'warning' | 'info';
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  primaryImage: string | null;
  lastRestocked: Date | null;
  daysSinceRestock: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity'); // critical, warning, or all
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get settings for threshold
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { lowStockAlertThreshold: true },
    });
    const globalThreshold = settings?.lowStockAlertThreshold || 10;

    // Build query
    const conditions: string[] = [
      `"trackInventory" = true`,
      `"isPublished" = true`,
    ];

    if (severity === 'critical') {
      conditions.push(`"stockQuantity" = 0`);
    } else if (severity === 'warning') {
      conditions.push(`"stockQuantity" > 0`);
      conditions.push(`("stockQuantity" <= "minStockLevel" OR "stockQuantity" <= ${globalThreshold})`);
    } else {
      // All alerts: out of stock or below threshold
      conditions.push(`("stockQuantity" = 0 OR "stockQuantity" <= "minStockLevel" OR "stockQuantity" <= ${globalThreshold})`);
    }

    if (categoryId) {
      conditions.push(`"categoryId" = '${categoryId}'`);
    }

    if (brandId) {
      conditions.push(`"brandId" = '${brandId}'`);
    }

    const whereClause = conditions.join(' AND ');

    // Get products with low stock
    const products = await prisma.$queryRawUnsafe<Array<{
      id: string;
      sku: string;
      name: string;
      slug: string;
      stockQuantity: number;
      minStockLevel: number;
      stockStatus: string;
      categoryId: string;
      brandId: string;
      createdAt: Date;
    }>>(
      `SELECT id, sku, name, slug, "stockQuantity", "minStockLevel", "stockStatus", "categoryId", "brandId", "createdAt"
       FROM products
       WHERE ${whereClause}
       ORDER BY "stockQuantity" ASC, name ASC
       LIMIT ${limit}`
    );

    if (products.length === 0) {
      return NextResponse.json({
        alerts: [],
        summary: {
          critical: 0,
          warning: 0,
          total: 0,
        },
      });
    }

    // Get related data
    const productIds = products.map(p => p.id);
    const [categories, brands, images, restockLogs] = await Promise.all([
      prisma.category.findMany({
        where: { id: { in: products.map(p => p.categoryId) } },
        select: { id: true, name: true },
      }),
      prisma.brand.findMany({
        where: { id: { in: products.map(p => p.brandId) } },
        select: { id: true, name: true },
      }),
      prisma.productImage.findMany({
        where: { productId: { in: productIds }, isPrimary: true },
        select: { productId: true, url: true },
      }),
      prisma.inventoryLog.findMany({
        where: {
          productId: { in: productIds },
          reason: 'restock',
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['productId'],
        select: { productId: true, createdAt: true },
      }),
    ]);

    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const brandMap = new Map(brands.map(b => [b.id, b]));
    const imageMap = new Map(images.map(i => [i.productId, i.url]));
    const restockMap = new Map(restockLogs.map(l => [l.productId, l.createdAt]));

    // Calculate severity and format alerts
    const alerts: InventoryAlert[] = products.map(product => {
      const lastRestocked = restockMap.get(product.id) || null;
      const daysSinceRestock = lastRestocked
        ? Math.floor((Date.now() - lastRestocked.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let alertSeverity: 'critical' | 'warning' | 'info' = 'info';
      if (product.stockQuantity === 0) {
        alertSeverity = 'critical';
      } else if (product.stockQuantity <= product.minStockLevel) {
        alertSeverity = 'warning';
      }

      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        stockQuantity: product.stockQuantity,
        minStockLevel: product.minStockLevel,
        stockStatus: product.stockStatus,
        severity: alertSeverity,
        category: categoryMap.get(product.categoryId) || null,
        brand: brandMap.get(product.brandId) || null,
        primaryImage: imageMap.get(product.id) || null,
        lastRestocked,
        daysSinceRestock,
      };
    });

    // Calculate summary
    const summary = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      total: alerts.length,
    };

    return NextResponse.json({
      alerts,
      summary,
      threshold: globalThreshold,
    });
  } catch (error) {
    console.error('Inventory alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    );
  }
}
