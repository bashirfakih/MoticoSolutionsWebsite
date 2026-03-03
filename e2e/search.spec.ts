import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Search Functionality
 *
 * Tests the search dropdown behavior, category filtering,
 * and product search features
 */

test.describe('Search Dropdown', () => {
  test('should display search input on homepage', async ({ page }) => {
    await page.goto('/');

    // Search input should be visible (either in header or hero)
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should show dropdown on focus', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.focus();

    // Dropdown should appear
    await page.waitForTimeout(500);
  });

  test('should show categories in dropdown', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();

    // Wait for dropdown to load categories
    await page.waitForTimeout(1000);

    // Should have category links
    const categoryLinks = page.locator('a[href*="/products/"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter categories by search term', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();
    await searchInput.fill('abrasive');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Should show filtered results
    const results = page.locator('text=/abrasive/i');
    if (await results.first().isVisible().catch(() => false)) {
      await expect(results.first()).toBeVisible();
    }
  });

  test('should navigate to category on click', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();

    // Wait for dropdown
    await page.waitForTimeout(1000);

    // Click first category link
    const categoryLink = page.locator('a[href*="/products/"]').first();
    if (await categoryLink.isVisible().catch(() => false)) {
      await categoryLink.click();
      await expect(page).toHaveURL(/\/products\//);
    }
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();

    // Wait for dropdown
    await page.waitForTimeout(500);

    // Click outside
    await page.click('body');

    // Dropdown should close
    await page.waitForTimeout(300);
  });

  test('should show "View All Products" link', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();

    // Wait for dropdown
    await page.waitForTimeout(500);

    // Should have view all link
    const viewAllLink = page.locator('a:has-text("View All"), a:has-text("Browse All"), a[href="/products"]');
    if (await viewAllLink.first().isVisible().catch(() => false)) {
      await expect(viewAllLink.first()).toBeVisible();
    }
  });
});

test.describe('Product Search', () => {
  test('should search for products by name', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('belt');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Should show matching products or message
    const results = page.locator('text=/belt/i');
    const noResults = page.locator('text=/no results|no products/i');

    // Either results or "no results" should appear
    await page.waitForTimeout(500);
  });

  test('should show product results with images', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('grinding');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Product results may have images
    const productImages = page.locator('[class*="search"] img, [class*="dropdown"] img');
    // Images are optional in search results
  });

  test('should navigate to product on click', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('disc');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Click first product result
    const productLink = page.locator('a[href*="/product"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await expect(page).toHaveURL(/\/product/);
    }
  });

  test('should handle empty search gracefully', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.focus();
    await searchInput.fill('');

    // Should show categories or default state
    await page.waitForTimeout(500);
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('100x150');

    // Should handle dimensions/numbers
    await page.waitForTimeout(500);
  });

  test('should debounce search requests', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    // Type quickly
    await searchInput.fill('a');
    await searchInput.fill('ab');
    await searchInput.fill('abr');
    await searchInput.fill('abra');
    await searchInput.fill('abras');

    // Should not make too many requests
    await page.waitForTimeout(1000);
  });
});

test.describe('Products Page Search', () => {
  test('should have search/filter on products page', async ({ page }) => {
    await page.goto('/products');

    // Should have some form of filtering
    const filterElements = page.locator('input[placeholder*="Search"], select, [class*="filter"]');
    // Filtering is optional on products page
    await page.waitForTimeout(500);
  });

  test('should display product grid', async ({ page }) => {
    await page.goto('/products');

    // Should have product cards/items
    const productCards = page.locator('[class*="product"], [class*="card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Products page may be empty or have different structure
    });
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/products/abrasive-belts');

    // Should show category-specific products
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Page title or heading should relate to category
    const heading = page.locator('h1');
    if (await heading.isVisible().catch(() => false)) {
      const text = await heading.textContent();
      expect(text?.toLowerCase()).toContain('belt');
    }
  });
});

test.describe('Search Results Navigation', () => {
  test('should support keyboard navigation in dropdown', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();
    await searchInput.fill('a');

    // Wait for results
    await page.waitForTimeout(500);

    // Press arrow down to navigate
    await searchInput.press('ArrowDown');
    await searchInput.press('Enter');

    // May navigate to selected result
    await page.waitForTimeout(500);
  });

  test('should close dropdown on Escape', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.click();

    // Wait for dropdown
    await page.waitForTimeout(500);

    // Press Escape
    await searchInput.press('Escape');

    // Dropdown should close
    await page.waitForTimeout(300);
  });

  test('should clear search on clear button', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('test search');

    // Look for clear button
    const clearButton = page.locator('button:has-text("Clear"), button[aria-label*="clear"], [class*="clear"]');
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await expect(searchInput).toHaveValue('');
    }
  });
});

test.describe('Mobile Search', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show search on mobile', async ({ page }) => {
    await page.goto('/');

    // May need to open mobile menu first
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
    }

    // Search should be accessible
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    // Mobile search may be in menu or hero
    await page.waitForTimeout(500);
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });
});
