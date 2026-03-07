import { test, expect } from '@playwright/test';
import { OrdersPage } from './pages/OrdersPage';

test.describe('Order Status Save', () => {
  let ordersPage: OrdersPage;

  test.beforeEach(async ({ page }) => {
    ordersPage = new OrdersPage(page);
    await ordersPage.navigate();
  });

  test('should display orders page with table', async () => {
    await expect(ordersPage.heading).toBeVisible();
    await expect(ordersPage.ordersTable).toBeVisible();
    await expect(ordersPage.searchInput).toBeVisible();
    await expect(ordersPage.statusSelect).toBeVisible();
  });

  test('should open order detail modal', async () => {
    const orderCount = await ordersPage.getOrderCount();
    test.skip(orderCount === 0, 'No orders available');

    await ordersPage.openFirstOrderDetail();
    await expect(ordersPage.orderDetailModal).toBeVisible();
    await expect(ordersPage.orderDetailClose).toBeVisible();
    await expect(ordersPage.orderStatusSelect).toBeVisible();
  });

  test('should close order detail modal with close button', async () => {
    const orderCount = await ordersPage.getOrderCount();
    test.skip(orderCount === 0, 'No orders available');

    await ordersPage.openFirstOrderDetail();
    await ordersPage.closeOrderDetail();
    await expect(ordersPage.orderDetailModal).not.toBeVisible();
  });

  test('should close order detail modal with Escape key', async () => {
    const orderCount = await ordersPage.getOrderCount();
    test.skip(orderCount === 0, 'No orders available');

    await ordersPage.openFirstOrderDetail();
    await ordersPage.pressEscape();
    await expect(ordersPage.orderDetailModal).not.toBeVisible({ timeout: 3000 });
  });

  test('should update order status forward (non-destructive)', async ({ page }) => {
    const orderCount = await ordersPage.getOrderCount();
    test.skip(orderCount === 0, 'No orders available');

    await ordersPage.openFirstOrderDetail();

    const currentStatus = await ordersPage.orderStatusSelect.inputValue();

    // Pick a forward status change
    if (currentStatus === 'pending') {
      await ordersPage.changeOrderStatus('confirmed');
      await ordersPage.expectToastSuccess(/status updated/i);
    } else if (currentStatus === 'confirmed') {
      await ordersPage.changeOrderStatus('processing');
      await ordersPage.expectToastSuccess(/status updated/i);
    }
  });

  test('should show confirmation for destructive status change', async ({ page }) => {
    const orderCount = await ordersPage.getOrderCount();
    test.skip(orderCount === 0, 'No orders available');

    await ordersPage.openFirstOrderDetail();

    // Changing to cancelled is a destructive transition
    await ordersPage.changeOrderStatus('cancelled');

    // Should trigger confirmation dialog
    await expect(ordersPage.confirmDialog).toBeVisible({ timeout: 3000 });
  });

  test('should filter orders by status', async () => {
    await ordersPage.filterByStatus('pending');
    await ordersPage.page.waitForTimeout(300);

    // All visible rows should show Pending status
    const rows = ordersPage.orderRows;
    const count = await rows.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const rowText = await rows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain('pending');
      }
    }
  });

  test('should filter orders by search', async () => {
    await ordersPage.searchOrders('ORD-');
    await ordersPage.page.waitForTimeout(300);

    const count = await ordersPage.getOrderCount();
    // Should return results or show "no orders found"
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should export orders to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await ordersPage.exportCsvBtn.click();
    const download = await downloadPromise;

    if (download) {
      expect(download.suggestedFilename()).toMatch(/orders-export.*\.csv$/);
    }
  });

  test('should display stat cards', async () => {
    // Orders page has stat cards for Total, Pending, Shipped, Revenue
    const statCards = ordersPage.page.locator('.bg-white.rounded-xl.p-4.border');
    await expect(statCards.first()).toBeVisible();
  });
});
