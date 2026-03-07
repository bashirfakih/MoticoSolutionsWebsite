import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly statusSelect: Locator;
  readonly ordersTable: Locator;
  readonly orderRows: Locator;
  readonly exportCsvBtn: Locator;
  readonly createOrderLink: Locator;
  readonly orderDetailModal: Locator;
  readonly orderDetailClose: Locator;
  readonly orderStatusSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1:has-text("Orders")');
    this.searchInput = page.locator('input[placeholder="Search orders..."]');
    this.statusSelect = page.locator('select').first();
    this.ordersTable = page.locator('table');
    this.orderRows = page.locator('tbody tr');
    this.exportCsvBtn = page.locator('button:has-text("Export CSV")');
    this.createOrderLink = page.locator('a:has-text("Create Order")');
    this.orderDetailModal = page.locator('.fixed.inset-0 .bg-white.rounded-2xl');
    this.orderDetailClose = page.locator('button[aria-label="Close order details"]');
    this.orderStatusSelect = this.orderDetailModal.locator('select').first();
  }

  async navigate() {
    await this.goto('/admin/orders');
    await expect(this.heading).toBeVisible({ timeout: 15000 });
    // Wait for table to load
    await this.page.waitForTimeout(500);
  }

  async searchOrders(query: string) {
    await this.searchInput.fill(query);
  }

  async filterByStatus(status: string) {
    await this.statusSelect.selectOption(status);
  }

  async openFirstOrderDetail() {
    await expect(this.orderRows.first()).toBeVisible({ timeout: 5000 });
    const viewBtn = this.orderRows.first().locator('button').last();
    await viewBtn.click();
    await expect(this.orderDetailModal).toBeVisible({ timeout: 10000 });
    // Wait for modal to stabilize (React re-renders)
    await this.page.waitForTimeout(500);
  }

  async closeOrderDetail() {
    await expect(this.orderDetailClose).toBeVisible({ timeout: 3000 });
    await this.orderDetailClose.click();
    await expect(this.orderDetailModal).not.toBeVisible({ timeout: 5000 });
  }

  async changeOrderStatus(newStatus: string) {
    await this.orderStatusSelect.selectOption(newStatus);
  }

  async getOrderCount(): Promise<number> {
    return await this.orderRows.count();
  }

  async expectNoOrders() {
    await expect(this.page.locator('text=No orders found')).toBeVisible();
  }
}
