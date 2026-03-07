import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CategoriesPage extends BasePage {
  readonly heading: Locator;
  readonly addCategoryBtn: Locator;
  readonly modalTitle: Locator;
  readonly nameInput: Locator;
  readonly slugInput: Locator;
  readonly createBtn: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;
  readonly categoryRows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1:has-text("Categories")');
    this.addCategoryBtn = page.getByRole('button', { name: /add category/i });
    this.modalTitle = page.getByRole('heading', { level: 3 }).first();
    this.nameInput = page.locator('input[placeholder="Category name"]');
    this.slugInput = page.locator('input[placeholder="url-slug"]');
    this.createBtn = page.locator('button:has-text("Create")');
    this.saveBtn = page.locator('button:has-text("Save")');
    this.cancelBtn = page.locator('button:has-text("Cancel")');
    this.categoryRows = page.locator('.group');
  }

  async navigate() {
    await this.goto('/admin/categories');
    await expect(this.heading).toBeVisible({ timeout: 10000 });
    // Wait for categories to load
    await this.page.waitForLoadState('networkidle');
  }

  async openAddModal() {
    await this.addCategoryBtn.click();
    await expect(this.modalTitle).toContainText('Add Category');
  }

  async fillCategoryName(name: string) {
    await this.nameInput.click();
    await this.nameInput.fill(name);
    // Verify value was set in React state (button should enable)
    await expect(this.nameInput).toHaveValue(name, { timeout: 3000 });
  }

  async fillSlug(slug: string) {
    await this.slugInput.click();
    await this.slugInput.fill(slug);
    await expect(this.slugInput).toHaveValue(slug, { timeout: 3000 });
  }

  async submitCreate() {
    await this.createBtn.click();
  }

  async submitSave() {
    await this.saveBtn.click();
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  async expectModalClosed() {
    await expect(this.modalTitle).not.toBeVisible({ timeout: 5000 });
  }

  async expectModalOpen(title: string | RegExp) {
    await expect(this.modalTitle).toContainText(title);
  }

  async selectIcon(iconName: string) {
    await this.page.click(`button[title="${iconName}"]`);
  }

  async selectColor(colorName: string) {
    await this.page.click(`button[title="${colorName}"]`);
  }

  async editFirstCategory() {
    const row = this.categoryRows.first();
    await row.hover();
    // Buttons have opacity-0 until group-hover — force click
    await row.locator('button[title="Edit"]').click({ force: true });
    await this.expectModalOpen('Edit Category');
  }

  async deleteFirstCategory() {
    await this.categoryRows.first().waitFor({ state: 'visible', timeout: 10000 });
    const row = this.categoryRows.first();
    await row.hover();
    await this.page.waitForTimeout(300);
    const deleteBtn = row.getByRole('button', { name: 'Delete category' });
    await deleteBtn.click({ force: true });
    // Wait for confirm dialog to appear
    await this.confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
  }
}
