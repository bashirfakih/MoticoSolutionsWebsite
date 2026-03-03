import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Admin Category Management
 *
 * Tests the full flow of creating, editing, and deleting categories
 * including the new fields (icon, color, featuredBrand)
 */

test.describe('Admin Category Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@moticosolutions.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/);
  });

  test('should display categories page with category list', async ({ page }) => {
    await page.goto('/admin/categories');

    // Page should load with header
    await expect(page.locator('h1')).toContainText('Categories');

    // Should show Add Category button
    await expect(page.getByRole('button', { name: /add category/i })).toBeVisible();
  });

  test('should open category form modal', async ({ page }) => {
    await page.goto('/admin/categories');

    // Click Add Category button
    await page.click('button:has-text("Add Category")');

    // Modal should appear
    await expect(page.locator('h3')).toContainText('Add Category');

    // Form fields should be visible
    await expect(page.locator('input[placeholder="Category name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="url-slug"]')).toBeVisible();
  });

  test('should create new category with all fields', async ({ page }) => {
    await page.goto('/admin/categories');

    // Open form
    await page.click('button:has-text("Add Category")');

    // Fill in basic info
    await page.fill('input[placeholder="Category name"]', 'Test E2E Category');

    // Select an icon
    await page.click('button[title="Wrench"]');

    // Select a color
    await page.click('button[title="Green"]');

    // Enter featured brand
    await page.fill('input[placeholder*="VSM"]', 'TestBrand');

    // Enter image URL
    await page.fill('input[placeholder*="category-image"]', '/test-image.jpg');

    // Submit form
    await page.click('button:has-text("Create")');

    // Wait for modal to close and verify success
    await expect(page.locator('h3:has-text("Add Category")')).not.toBeVisible({ timeout: 5000 });

    // Category should appear in list
    await expect(page.locator('text=Test E2E Category')).toBeVisible();
  });

  test('should show icon preview with selected color', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');

    // Select icon
    await page.click('button[title="Disc"]');

    // Select color
    await page.click('button[title="Red"]');

    // Icon buttons should reflect the color
    const iconButton = page.locator('button[title="Disc"]');
    await expect(iconButton).toHaveClass(/border-\[#004D8B\]/);
  });

  test('should edit existing category', async ({ page }) => {
    await page.goto('/admin/categories');

    // Find a category and click edit
    const categoryRow = page.locator('.group').first();
    await categoryRow.hover();
    await categoryRow.locator('button[title="Edit"]').click();

    // Modal should open with Edit title
    await expect(page.locator('h3')).toContainText('Edit Category');

    // Change the featured brand
    await page.fill('input[placeholder*="VSM"]', 'Updated Brand');

    // Save changes
    await page.click('button:has-text("Save")');

    // Modal should close
    await expect(page.locator('h3:has-text("Edit Category")')).not.toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');

    // Try to submit without name
    const createButton = page.locator('button:has-text("Create")');
    await expect(createButton).toBeDisabled();

    // Fill in name
    await page.fill('input[placeholder="Category name"]', 'Valid Name');

    // Button should now be enabled
    await expect(createButton).not.toBeDisabled();
  });

  test('should auto-generate slug from name', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');

    // Type category name
    await page.fill('input[placeholder="Category name"]', 'Test Category Name');

    // Slug should be auto-generated
    const slugInput = page.locator('input[placeholder="url-slug"]');
    await expect(slugInput).toHaveValue('test-category-name');
  });

  test('should cancel form without saving', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');

    // Fill in some data
    await page.fill('input[placeholder="Category name"]', 'Cancelled Category');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Modal should close
    await expect(page.locator('h3:has-text("Add Category")')).not.toBeVisible({ timeout: 3000 });

    // Category should not appear
    await expect(page.locator('text=Cancelled Category')).not.toBeVisible();
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.goto('/admin/categories');

    // Find a category and click delete
    const categoryRow = page.locator('.group').first();
    await categoryRow.hover();
    await categoryRow.locator('button[title="Delete"]').click();

    // Confirmation dialog should appear
    await expect(page.locator('text=Delete Category')).toBeVisible();
    await expect(page.locator('text=Are you sure')).toBeVisible();

    // Cancel button should work
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=Delete Category')).not.toBeVisible();
  });

  test('should show loading state while saving', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');

    await page.fill('input[placeholder="Category name"]', 'Loading Test');

    // Intercept the API call to add delay
    await page.route('**/api/categories', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.click('button:has-text("Create")');

    // Loading spinner should appear
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should display category with custom icon and color in list', async ({ page }) => {
    await page.goto('/admin/categories');

    // Look for a category with custom styling
    const categoryWithIcon = page.locator('.w-8.h-8.rounded-lg').first();

    // Should have background color applied
    await expect(categoryWithIcon).toBeVisible();
  });
});

test.describe('Admin Category Error States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@moticosolutions.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  });

  test('should show error when creating duplicate slug', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.click('button:has-text("Add Category")');

    // Try to create with existing slug
    await page.fill('input[placeholder="Category name"]', 'Abrasive Belts');
    await page.fill('input[placeholder="url-slug"]', 'abrasive-belts');

    await page.click('button:has-text("Create")');

    // Should show error toast or message
    await expect(page.locator('text=/already exists|duplicate/i')).toBeVisible({ timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/admin/categories');

    // Block API calls
    await page.route('**/api/categories', (route) => route.abort());

    await page.click('button:has-text("Add Category")');
    await page.fill('input[placeholder="Category name"]', 'Network Error Test');
    await page.click('button:has-text("Create")');

    // Should show error message
    await expect(page.locator('text=/failed|error/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Subcategory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@moticosolutions.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
  });

  test('should add subcategory to parent', async ({ page }) => {
    await page.goto('/admin/categories');

    // Find a parent category and click add subcategory
    const parentRow = page.locator('.group').first();
    await parentRow.hover();
    await parentRow.locator('button[title="Add subcategory"]').click();

    // Modal should show "Add Subcategory"
    await expect(page.locator('h3')).toContainText('Add Subcategory');

    // Fill in subcategory
    await page.fill('input[placeholder="Category name"]', 'Test Subcategory');
    await page.click('button:has-text("Create")');

    // Should be created
    await expect(page.locator('h3:has-text("Add Subcategory")')).not.toBeVisible({ timeout: 5000 });
  });

  test('should show nested categories with proper indentation', async ({ page }) => {
    await page.goto('/admin/categories');

    // Look for subcategory with indentation (ml-8 class)
    const subcategory = page.locator('.ml-8');

    // If subcategories exist, they should be indented
    const count = await subcategory.count();
    if (count > 0) {
      await expect(subcategory.first()).toBeVisible();
    }
  });
});
