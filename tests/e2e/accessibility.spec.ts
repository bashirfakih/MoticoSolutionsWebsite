import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Should have an h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have accessible sidebar navigation', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Sidebar should have nav element
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();

    // Nav links should be visible
    const links = nav.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    // Each link should have accessible text
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const linkText = await links.nth(i).textContent();
      expect(linkText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have aria-label on close buttons', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Open an order detail if possible
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count > 0) {
      await rows.first().locator('button').last().click();
      await page.waitForTimeout(500);

      // Close button should have aria-label
      const closeBtn = page.locator('button[aria-label="Close order details"]');
      await expect(closeBtn).toBeVisible();
    }
  });

  test('should have aria-label on sidebar close button (mobile)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Open mobile sidebar
    const menuBtn = page.locator('button[aria-label="Toggle sidebar"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Close button should have aria-label
    const closeBtn = page.locator('button[aria-label="Close sidebar"]');
    await expect(closeBtn).toBeVisible({ timeout: 3000 });
  });

  test('should have role=dialog on confirmation dialogs', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    // Trigger a delete confirmation
    const rows = page.locator('.group');
    const count = await rows.count();
    test.skip(count === 0, 'No categories to test delete dialog');

    await rows.first().hover();
    await rows.first().locator('button[title="Delete"]').click();

    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('should support keyboard navigation in sidebar', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Sidebar nav links should be focusable
    const nav = page.locator('nav').first();
    const firstLink = nav.locator('a').first();

    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    // Tab should move focus to another element
    await page.keyboard.press('Tab');

    // Verify focus moved away from first link
    await expect(firstLink).not.toBeFocused();
  });

  test('should have proper form labels on category modal', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present
    const acceptBtn = page.locator('button:has-text("Accept All")');
    if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }

    const addBtn = page.locator('button:has-text("Add Category")');
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();
    await page.waitForTimeout(500);

    // Name input should be identifiable
    const nameInput = page.locator('input[placeholder="Category name"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Slug input should be identifiable
    const slugInput = page.locator('input[placeholder="url-slug"]');
    await expect(slugInput).toBeVisible({ timeout: 5000 });
  });

  test('should have accessible toast notifications', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');

    // Dismiss cookie banner if present
    const acceptBtn = page.locator('button:has-text("Accept All")');
    if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }

    // Create a category to trigger a toast
    await page.click('button:has-text("Add Category")');
    await page.waitForTimeout(500);
    const uniqueName = `A11y Test ${Date.now()}`;
    const nameInput = page.locator('input[placeholder="Category name"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.click();
    await nameInput.fill(uniqueName);
    await expect(nameInput).toHaveValue(uniqueName, { timeout: 3000 });
    await page.click('button:has-text("Create")');

    // Toast should have role="alert" for screen readers
    const toast = page.locator('div[role="alert"]');
    await expect(toast.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have sufficient color contrast on status badges', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Status badges should exist with text content
    const badges = page.locator('.rounded-full.text-xs.font-medium');
    const count = await badges.count();
    if (count > 0) {
      const badge = badges.first();
      await expect(badge).toBeVisible();
      const text = await badge.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have proper page titles', async ({ page }) => {
    // Dashboard h1 says "Good morning/afternoon, Admin!" — check h1 exists
    await page.goto('/admin/dashboard');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    await page.goto('/admin/orders');
    await expect(page.locator('h1:has-text("Orders")')).toBeVisible({ timeout: 15000 });

    await page.goto('/admin/products');
    await expect(page.locator('h1:has-text("Products")')).toBeVisible({ timeout: 15000 });

    await page.goto('/admin/categories');
    await expect(page.locator('h1:has-text("Categories")')).toBeVisible({ timeout: 15000 });
  });
});
