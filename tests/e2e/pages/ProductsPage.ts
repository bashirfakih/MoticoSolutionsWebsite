import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly addProductLink: Locator;
  readonly exportCsvBtn: Locator;
  readonly filterToggle: Locator;
  readonly selectAllCheckbox: Locator;
  readonly bulkActionsBtn: Locator;
  readonly productRows: Locator;
  readonly deleteDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1:has-text("Products")');
    this.searchInput = page.locator('input[placeholder="Search products..."]');
    this.addProductLink = page.locator('a:has-text("Add Product")');
    this.exportCsvBtn = page.locator('button:has-text("Export CSV")');
    this.filterToggle = page.locator('button:has-text("Filters")');
    this.selectAllCheckbox = page.locator('thead input[type="checkbox"]');
    this.bulkActionsBtn = page.locator('button:has-text("Bulk Actions")');
    this.productRows = page.locator('tbody tr');
    this.deleteDialog = page.locator('div[role="dialog"][aria-modal="true"]');
  }

  async navigate() {
    await this.goto('/admin/products');
    await expect(this.heading).toBeVisible({ timeout: 30000 });
    // Reset filter chips to empty arrays (removing the key triggers default chips)
    const hadNonEmptyFilters = await this.page.evaluate(() => {
      const key = 'motico_saved_filters_products';
      const current = localStorage.getItem(key);
      if (current !== '[]') {
        localStorage.setItem(key, '[]');
        return true;
      }
      return false;
    });
    if (hadNonEmptyFilters) {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await expect(this.heading).toBeVisible({ timeout: 30000 });
    }
    // Wait for products to finish loading (spinner disappears, rows appear)
    await this.page.locator('text=Loading...').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async searchProducts(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounced search (300ms) + API response
    await this.page.waitForTimeout(800);
    await this.page.locator('text=Loading...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async selectAllProducts() {
    // React controlled checkbox — use click() instead of check()
    await this.selectAllCheckbox.click();
  }

  async selectProductByIndex(index: number) {
    const checkbox = this.productRows.nth(index).locator('input[type="checkbox"]');
    await checkbox.click();
  }

  async openBulkActions() {
    await this.bulkActionsBtn.click();
  }

  async bulkPublish() {
    await this.openBulkActions();
    const menu = this.page.locator('.z-20.w-40');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await menu.locator('button:has-text("Publish")').first().click();
  }

  async bulkUnpublish() {
    await this.openBulkActions();
    const menu = this.page.locator('.z-20.w-40');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await menu.locator('button:has-text("Unpublish")').click();
  }

  async bulkDelete() {
    await this.openBulkActions();
    const menu = this.page.locator('.z-20.w-40');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await menu.locator('button:has-text("Delete")').click();
  }

  async openProductActions(index: number) {
    const actionBtn = this.productRows.nth(index).locator('button[aria-label="Product actions"]');
    await actionBtn.click();
    // Wait for dropdown menu to appear
    await expect(this.page.locator('.z-20.w-48')).toBeVisible({ timeout: 3000 });
  }

  async getProductCount(): Promise<number> {
    return await this.productRows.count();
  }

  async clickAddProduct() {
    await expect(this.addProductLink).toBeVisible({ timeout: 5000 });
    await this.addProductLink.click();
    await this.page.waitForURL(/\/admin\/products\/new/, { timeout: 30000, waitUntil: 'domcontentloaded' });
  }
}
