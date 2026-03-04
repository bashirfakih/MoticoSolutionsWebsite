/**
 * Inventory Alert Notifications API Route
 *
 * POST /api/inventory/alerts/notify - Send inventory alert email notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get settings
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: {
        emailOrderNotification: true,
        lowStockThreshold: true,
        enableEmailNotifications: true,
      },
    });

    if (!settings?.enableEmailNotifications) {
      return NextResponse.json({
        success: false,
        message: 'Email notifications are disabled in settings',
      });
    }

    const notificationEmail = settings.emailOrderNotification;
    if (!notificationEmail) {
      return NextResponse.json({
        success: false,
        message: 'No notification email configured in settings',
      });
    }

    const threshold = settings.lowStockThreshold || 10;

    // Get critical and warning products
    const products = await prisma.product.findMany({
      where: {
        trackInventory: true,
        isPublished: true,
        OR: [
          { stockQuantity: 0 },
          { stockQuantity: { lte: threshold } },
        ],
      },
      select: {
        id: true,
        sku: true,
        name: true,
        stockQuantity: true,
        minStockLevel: true,
        stockStatus: true,
        category: { select: { name: true } },
      },
      orderBy: { stockQuantity: 'asc' },
      take: 50,
    });

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No inventory alerts to send',
        alertCount: 0,
      });
    }

    // Prepare email content
    const criticalItems = products.filter(p => p.stockQuantity === 0);
    const warningItems = products.filter(p => p.stockQuantity > 0);

    const email = emailTemplates.inventoryAlert(
      criticalItems.map(p => ({
        name: p.name,
        sku: p.sku,
        quantity: p.stockQuantity,
        category: p.category.name,
      })),
      warningItems.map(p => ({
        name: p.name,
        sku: p.sku,
        quantity: p.stockQuantity,
        minLevel: p.minStockLevel,
        category: p.category.name,
      })),
      threshold
    );

    const result = await sendEmail({
      to: notificationEmail,
      subject: email.subject,
      html: email.html,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Inventory alert sent to ${notificationEmail}`
        : 'Failed to send notification',
      alertCount: products.length,
      criticalCount: criticalItems.length,
      warningCount: warningItems.length,
    });
  } catch (error) {
    console.error('Inventory notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
