import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Homepage Category Display
 *
 * Tests that categories created in admin appear correctly on the homepage
 * with proper icons, colors, and branding
 */

test.describe('Homepage Category Display', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Page should have main content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display product categories section', async ({ page }) => {
    await page.goto('/');

    // Scroll to products section
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Section should be visible
    await expect(page.locator('#products')).toBeVisible();

    // Should have heading
    await expect(page.locator('text=Built for Every')).toBeVisible();
  });

  test('should show category cards with proper styling', async ({ page }) => {
    await page.goto('/');

    // Scroll to products section
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Category cards should be visible
    const categoryCards = page.locator('.product-card');
    await expect(categoryCards.first()).toBeVisible();

    // Should have at least some categories
    const count = await categoryCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display category icons', async ({ page }) => {
    await page.goto('/');
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Look for icon containers in cards
    const iconContainers = page.locator('.card-icon');
    await expect(iconContainers.first()).toBeVisible();
  });

  test('should show featured brand badge on category cards', async ({ page }) => {
    await page.goto('/');
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Look for brand badges
    const brandBadges = page.locator('text=/Hermes|DCA|ZAT|Hoffmann|Eisenblätter/');
    await expect(brandBadges.first()).toBeVisible();
  });

  test('should show product count on category cards', async ({ page }) => {
    await page.goto('/');
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Look for product count badges
    const productCounts = page.locator('text=/\\d+\\+ products|\\d+ products/');
    await expect(productCounts.first()).toBeVisible();
  });

  test('should navigate to category page on card click', async ({ page }) => {
    await page.goto('/');
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Click first category card
    const firstCard = page.locator('.product-card a').first();
    await firstCard.click();

    // Should navigate to products page
    await expect(page).toHaveURL(/\/products\//);
  });

  test('should have "View All Products" button', async ({ page }) => {
    await page.goto('/');
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Find and click view all button
    const viewAllButton = page.locator('a:has-text("View All 700+ Products")');
    await expect(viewAllButton).toBeVisible();

    await viewAllButton.click();
    await expect(page).toHaveURL('/products');
  });

  test('should animate cards on scroll', async ({ page }) => {
    await page.goto('/');

    // Scroll to products section
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Wait for animation
    await page.waitForTimeout(500);

    // Cards should be visible (animation completed)
    const visibleCard = page.locator('.product-card').first();
    await expect(visibleCard).toBeVisible();
  });
});

test.describe('Homepage Category Loading States', () => {
  test('should show categories from database', async ({ page }) => {
    // Intercept API call
    let apiCalled = false;
    await page.route('**/api/categories*', async (route) => {
      apiCalled = true;
      await route.continue();
    });

    await page.goto('/');

    // Wait for API call
    await page.waitForTimeout(1000);

    // Categories should be fetched from database
    expect(apiCalled).toBe(true);
  });

  test('should fallback gracefully on API error', async ({ page }) => {
    // Block API calls
    await page.route('**/api/categories*', (route) => route.abort());

    await page.goto('/');
    await page.locator('#products').scrollIntoViewIfNeeded();

    // Should still show fallback categories
    const categoryCards = page.locator('.product-card');
    await expect(categoryCards.first()).toBeVisible();
  });
});

test.describe('Homepage Navigation Menu Categories', () => {
  test('should show categories in Products dropdown', async ({ page }) => {
    await page.goto('/');

    // Hover over Products nav item
    await page.hover('button:has-text("Products")');

    // Dropdown should appear
    await expect(page.locator('.grid.grid-cols-3')).toBeVisible();

    // Should have category links
    const categoryLinks = page.locator('.grid.grid-cols-3 a');
    await expect(categoryLinks.first()).toBeVisible();
  });

  test('should show category icons in dropdown', async ({ page }) => {
    await page.goto('/');
    await page.hover('button:has-text("Products")');

    // Icon containers should be visible
    const icons = page.locator('.grid.grid-cols-3 .w-9.h-9');
    await expect(icons.first()).toBeVisible();
  });

  test('should navigate to category from dropdown', async ({ page }) => {
    await page.goto('/');
    await page.hover('button:has-text("Products")');

    // Click a category
    const categoryLink = page.locator('.grid.grid-cols-3 a').first();
    await categoryLink.click();

    // Should navigate
    await expect(page).toHaveURL(/\/products\//);
  });

  test('should have View All Products link in dropdown', async ({ page }) => {
    await page.goto('/');
    await page.hover('button:has-text("Products")');

    const viewAllLink = page.locator('a:has-text("View All Products")');
    await expect(viewAllLink).toBeVisible();
  });
});

test.describe('Homepage Mobile Menu Categories', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show mobile menu on small screens', async ({ page }) => {
    await page.goto('/');

    // Mobile hamburger button
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();
  });

  test('should show categories in mobile menu', async ({ page }) => {
    await page.goto('/');

    // Open mobile menu
    await page.click('button[aria-label="Toggle menu"]');

    // Products section should be visible
    await expect(page.locator('text=Products')).toBeVisible();

    // Category links should be visible
    const categoryLinks = page.locator('.grid.grid-cols-2 a');
    await expect(categoryLinks.first()).toBeVisible();
  });

  test('should navigate to category from mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Toggle menu"]');

    // Click a category
    const categoryLink = page.locator('.grid.grid-cols-2 a').first();
    await categoryLink.click();

    // Should navigate
    await expect(page).toHaveURL(/\/products\//);
  });
});
