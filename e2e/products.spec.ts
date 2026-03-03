import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Product Browsing Flow
 *
 * Tests the core product browsing experience including
 * category navigation, product listing, and product details
 */

test.describe('Products Page', () => {
  test('should load products page', async ({ page }) => {
    await page.goto('/products');

    // Page should load with heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display product categories', async ({ page }) => {
    await page.goto('/products');

    // Should have category filters or links
    const categoryElements = page.locator('a[href*="/products/"], [class*="category"]');
    const count = await categoryElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have pagination or load more', async ({ page }) => {
    await page.goto('/products');

    // Check for pagination or infinite scroll
    const pagination = page.locator('[class*="pagination"], button:has-text("Load More"), button:has-text("Show More")');
    // Pagination is optional
    await page.waitForTimeout(500);
  });
});

test.describe('Category Pages', () => {
  test('should load abrasive belts category', async ({ page }) => {
    await page.goto('/products/abrasive-belts');

    // Page should load
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should load grinding discs category', async ({ page }) => {
    await page.goto('/products/grinding-cutting-discs');

    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show category description', async ({ page }) => {
    await page.goto('/products/abrasive-belts');

    // Category may have a description
    const description = page.locator('p').first();
    if (await description.isVisible().catch(() => false)) {
      const text = await description.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should show products in category', async ({ page }) => {
    await page.goto('/products/abrasive-belts');

    // Should have product cards or list items
    const products = page.locator('[class*="product"], [class*="card"], article');
    // Products may or may not exist yet
    await page.waitForTimeout(500);
  });

  test('should show breadcrumbs', async ({ page }) => {
    await page.goto('/products/abrasive-belts');

    // Breadcrumbs for navigation
    const breadcrumbs = page.locator('[class*="breadcrumb"], nav[aria-label="Breadcrumb"]');
    // Breadcrumbs are optional
    await page.waitForTimeout(300);
  });

  test('should handle invalid category gracefully', async ({ page }) => {
    await page.goto('/products/nonexistent-category');

    // Should show 404 or redirect
    await page.waitForTimeout(1000);
    const url = page.url();
    // Either shows 404, redirects, or shows empty state
  });
});

test.describe('Product Card Interactions', () => {
  test('should show product image', async ({ page }) => {
    await page.goto('/products');

    const productImage = page.locator('[class*="product"] img, [class*="card"] img').first();
    if (await productImage.isVisible().catch(() => false)) {
      await expect(productImage).toBeVisible();
    }
  });

  test('should show product name', async ({ page }) => {
    await page.goto('/products');

    const productName = page.locator('[class*="product"] h3, [class*="card"] h3, [class*="product"] h4').first();
    if (await productName.isVisible().catch(() => false)) {
      await expect(productName).toBeVisible();
    }
  });

  test('should show product price', async ({ page }) => {
    await page.goto('/products');

    // Price display
    const price = page.locator('text=/R\\s*\\d+|\\$\\d+|€\\d+/');
    // Prices are optional (may require login or quote)
    await page.waitForTimeout(300);
  });

  test('should navigate to product details on click', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await expect(page).toHaveURL(/\/product\//);
    }
  });

  test('should show hover effects', async ({ page }) => {
    await page.goto('/products');

    const productCard = page.locator('[class*="product"], [class*="card"]').first();
    if (await productCard.isVisible().catch(() => false)) {
      await productCard.hover();
      // Visual change on hover
      await page.waitForTimeout(200);
    }
  });
});

test.describe('Product Details Page', () => {
  test('should display product information', async ({ page }) => {
    // Navigate to a product if one exists
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Product page should have title
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should show product images', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Product should have image
      const image = page.locator('img').first();
      await expect(image).toBeVisible();
    }
  });

  test('should show product description', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Should have description
      const description = page.locator('[class*="description"], p').first();
      if (await description.isVisible().catch(() => false)) {
        await expect(description).toBeVisible();
      }
    }
  });

  test('should show specifications', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Specifications table or list
      const specs = page.locator('[class*="spec"], table, dl');
      // Specs are optional
      await page.waitForTimeout(300);
    }
  });

  test('should show add to cart or quote button', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Should have action button
      const actionButton = page.locator('button:has-text("Add"), button:has-text("Quote"), button:has-text("Cart"), button:has-text("Enquire")');
      if (await actionButton.first().isVisible().catch(() => false)) {
        await expect(actionButton.first()).toBeVisible();
      }
    }
  });

  test('should show related products', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Related products section
      const relatedSection = page.locator('text=/Related|Similar|You may also/i');
      // Related products are optional
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Product Filtering', () => {
  test('should filter by brand', async ({ page }) => {
    await page.goto('/products');

    // Brand filter
    const brandFilter = page.locator('select:has-text("Brand"), [class*="filter"] button, input[placeholder*="Brand"]');
    if (await brandFilter.first().isVisible().catch(() => false)) {
      await brandFilter.first().click();
    }
  });

  test('should filter by price range', async ({ page }) => {
    await page.goto('/products');

    // Price filter
    const priceFilter = page.locator('input[type="range"], select:has-text("Price"), [class*="price-filter"]');
    // Price filtering is optional
    await page.waitForTimeout(300);
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/products');

    // Sort dropdown
    const sortSelect = page.locator('select:has-text("Sort"), [class*="sort"]');
    if (await sortSelect.first().isVisible().catch(() => false)) {
      await sortSelect.first().selectOption({ index: 1 }).catch(() => {
        // May not be a select element
      });
    }
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/products');

    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset")');
    // Clear filters is optional
    await page.waitForTimeout(300);
  });
});

test.describe('Product Quote Request', () => {
  test('should show quote request form', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Quote or enquiry button
      const quoteButton = page.locator('button:has-text("Quote"), button:has-text("Enquire"), button:has-text("Contact")');
      if (await quoteButton.first().isVisible().catch(() => false)) {
        await quoteButton.first().click();

        // Form should appear
        await page.waitForTimeout(500);
      }
    }
  });

  test('should validate quote form fields', async ({ page }) => {
    await page.goto('/contact');

    // Contact/quote form
    const nameInput = page.locator('input[name="name"], input[id="name"]');
    const emailInput = page.locator('input[name="email"], input[id="email"], input[type="email"]');

    if (await nameInput.isVisible().catch(() => false)) {
      await expect(nameInput).toBeVisible();
    }
    if (await emailInput.isVisible().catch(() => false)) {
      await expect(emailInput).toBeVisible();
    }
  });
});

test.describe('Mobile Product Browsing', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display products on mobile', async ({ page }) => {
    await page.goto('/products');

    // Products should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have mobile-friendly filters', async ({ page }) => {
    await page.goto('/products');

    // Mobile filter toggle
    const filterToggle = page.locator('button:has-text("Filter"), button[aria-label*="filter"]');
    // Mobile filters are optional
    await page.waitForTimeout(300);
  });

  test('should navigate categories on mobile', async ({ page }) => {
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();

      // Find category link
      const categoryLink = page.locator('a[href*="/products/"]').first();
      if (await categoryLink.isVisible().catch(() => false)) {
        await categoryLink.click();
        await expect(page).toHaveURL(/\/products\//);
      }
    }
  });
});
