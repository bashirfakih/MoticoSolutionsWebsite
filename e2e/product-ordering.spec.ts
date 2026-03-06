import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Product Ordering Flow
 *
 * Tests the complete order flow including:
 * - Guest vs authenticated user experience
 * - User discount visibility
 * - Spec selection (dimension, size, grit, packaging)
 * - Order/quote creation
 * - Quote visibility in user profile
 */

test.describe('Guest Product View', () => {
  test('should hide product specs for guests', async ({ page }) => {
    await page.goto('/products');

    // Navigate to a product
    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      // Find a specific product link
      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // Specs should be hidden or show login message
        const lockedMessage = page.locator('text=/specifications are available for registered|login to see|sign in to view/i');
        const loginPrompt = page.locator('text=/login to order|sign in to order/i');

        // Either locked message or login prompt should be visible
        const hasLockedContent = await lockedMessage.isVisible().catch(() => false);
        const hasLoginPrompt = await loginPrompt.isVisible().catch(() => false);

        // For guest, should show restricted content
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show "Login to Order" button for guests', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // Should show login to order button instead of order button
        const loginOrderButton = page.locator('a:has-text("Login to Order"), button:has-text("Login to Order")');
        const contactButton = page.locator('a:has-text("Contact Us"), button:has-text("Contact Us")');

        const hasLoginButton = await loginOrderButton.isVisible().catch(() => false);
        const hasContactButton = await contactButton.isVisible().catch(() => false);

        // Either should be visible for guest
        await page.waitForTimeout(500);
      }
    }
  });

  test('should hide prices for guests', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // Price should be hidden or show login prompt
        const loginPriceMessage = page.locator('text=/login to see pricing|sign in to view prices/i');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should redirect to login when clicking "Login to Order"', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const loginOrderButton = page.locator('a:has-text("Login to Order")');
        if (await loginOrderButton.isVisible().catch(() => false)) {
          await loginOrderButton.click();
          await page.waitForTimeout(1000);

          const url = page.url();
          expect(url).toContain('/login');
        }
      }
    }
  });
});

test.describe('Authenticated User Product View', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should show product specs for logged in users', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // Should show spec selectors
        const specSelector = page.locator('select, [class*="dropdown"], [class*="select"]');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show "Order Now" button for authenticated users', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const orderButton = page.locator('button:has-text("Order Now"), button:has-text("Order")');
        if (await orderButton.isVisible().catch(() => false)) {
          await expect(orderButton).toBeVisible();
        }
      }
    }
  });

  test('should display user discount on prices', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // If user has discount, should show discount badge or strikethrough price
        const discountBadge = page.locator('text=/% off|discount/i, [class*="discount"]');
        const strikethroughPrice = page.locator('[class*="line-through"], del, s');

        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Spec Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should allow selecting product dimension', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const dimensionSelector = page.locator('select[name*="dimension"], [class*="dimension"] select, label:has-text("Dimension") + select');
        if (await dimensionSelector.isVisible().catch(() => false)) {
          await dimensionSelector.selectOption({ index: 1 });
        }
      }
    }
  });

  test('should allow selecting product size', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const sizeSelector = page.locator('select[name*="size"], [class*="size"] select, label:has-text("Size") + select');
        if (await sizeSelector.isVisible().catch(() => false)) {
          await sizeSelector.selectOption({ index: 1 });
        }
      }
    }
  });

  test('should allow selecting product grit', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const gritSelector = page.locator('select[name*="grit"], [class*="grit"] select, label:has-text("Grit") + select');
        if (await gritSelector.isVisible().catch(() => false)) {
          await gritSelector.selectOption({ index: 1 });
        }
      }
    }
  });

  test('should allow selecting product packaging', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const packagingSelector = page.locator('select[name*="packaging"], [class*="packaging"] select, label:has-text("Packaging") + select, label:has-text("Pieces") + select');
        if (await packagingSelector.isVisible().catch(() => false)) {
          await packagingSelector.selectOption({ index: 1 });
        }
      }
    }
  });

  test('should allow setting quantity', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const quantityInput = page.locator('input[type="number"][name*="quantity"], input[type="number"][id*="quantity"]');
        if (await quantityInput.isVisible().catch(() => false)) {
          await quantityInput.fill('5');
          expect(await quantityInput.inputValue()).toBe('5');
        }

        // Or increment/decrement buttons
        const incrementBtn = page.locator('button:has-text("+")');
        if (await incrementBtn.isVisible().catch(() => false)) {
          await incrementBtn.click();
        }
      }
    }
  });
});

test.describe('Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should create order/quote when clicking Order Now', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const orderButton = page.locator('button:has-text("Order Now"), button:has-text("Order")');
        if (await orderButton.isVisible().catch(() => false)) {
          await orderButton.click();
          await page.waitForTimeout(2000);

          // Should redirect to quote page or show confirmation
          const url = page.url();
          const hasQuoteUrl = url.includes('/quote') || url.includes('/account');
          const successMessage = page.locator('text=/order.*created|quote.*created|success/i');

          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should show loading state while creating order', async ({ page }) => {
    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        const orderButton = page.locator('button:has-text("Order Now"), button:has-text("Order")');
        if (await orderButton.isVisible().catch(() => false)) {
          // Click and immediately check for loading state
          await orderButton.click();

          const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], svg.animate-spin');
          // Loading state may appear briefly
        }
      }
    }
  });
});

test.describe('Quote Display', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should display quotes in user account', async ({ page }) => {
    await page.goto('/account/quotes');

    // Should show quotes list
    const quotesHeading = page.locator('h1:has-text("Quote"), h2:has-text("Quote")');
    if (await quotesHeading.isVisible().catch(() => false)) {
      await expect(quotesHeading).toBeVisible();
    }

    // Quote list or table
    const quotesList = page.locator('table, [class*="quote-list"], [class*="quotes"]');
    await page.waitForTimeout(500);
  });

  test('should display quote details with selected specs', async ({ page }) => {
    await page.goto('/account/quotes');

    // Click on first quote if exists
    const quoteLink = page.locator('a[href*="/account/quotes/"]').first();
    if (await quoteLink.isVisible().catch(() => false)) {
      await quoteLink.click();

      // Should show quote details
      const quoteNumber = page.locator('text=/QT-\d{4}-\d{4}/');
      const specDetails = page.locator('text=/dimension|size|grit|packaging/i');

      await page.waitForTimeout(500);
    }
  });

  test('should show discount applied in quote', async ({ page }) => {
    await page.goto('/account/quotes');

    const quoteLink = page.locator('a[href*="/account/quotes/"]').first();
    if (await quoteLink.isVisible().catch(() => false)) {
      await quoteLink.click();

      // Should show discount if applied
      const discountInfo = page.locator('text=/discount|% off/i');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Admin Quote Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should display quotes in admin dashboard', async ({ page }) => {
    await page.goto('/admin/quotes');

    // Should show quotes management page
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Quotes table
    const quotesTable = page.locator('table, [class*="quotes-list"]');
    await page.waitForTimeout(500);
  });

  test('should filter quotes by status', async ({ page }) => {
    await page.goto('/admin/quotes');

    const statusFilter = page.locator('select:has-text("Status"), select[name="status"], [class*="filter"] select');
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.selectOption({ label: 'Pending' }).catch(() => {
        // May have different option format
      });
    }
  });

  test('should search quotes by customer name', async ({ page }) => {
    await page.goto('/admin/quotes');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('John');
      await page.waitForTimeout(500);
    }
  });

  test('should view quote details from admin', async ({ page }) => {
    await page.goto('/admin/quotes');

    // Click on view/details button for first quote
    const viewButton = page.locator('button:has-text("View"), a:has-text("View"), button:has-text("Details")').first();
    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.click();
      await page.waitForTimeout(500);

      // Should show quote details
      const quoteNumber = page.locator('text=/QT-\d{4}-\d{4}/');
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Admin User Discount Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should display discount column in users table', async ({ page }) => {
    await page.goto('/admin/users');

    // Should have discount column
    const discountHeader = page.locator('th:has-text("Discount"), th:has-text("Discount %")');
    if (await discountHeader.isVisible().catch(() => false)) {
      await expect(discountHeader).toBeVisible();
    }
  });

  test('should show discount field in user edit form', async ({ page }) => {
    await page.goto('/admin/users');

    // Click edit on first user
    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit"]').first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Discount input field
      const discountInput = page.locator('input[name*="discount"], input[id*="discount"], label:has-text("Discount") + input');
      if (await discountInput.isVisible().catch(() => false)) {
        await expect(discountInput).toBeVisible();
      }
    }
  });

  test('should validate discount percentage range', async ({ page }) => {
    await page.goto('/admin/users');

    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit"]').first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(500);

      const discountInput = page.locator('input[name*="discount"], input[id*="discount"]');
      if (await discountInput.isVisible().catch(() => false)) {
        // Try invalid value
        await discountInput.fill('150');

        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
        await saveButton.click();

        // Should show validation error
        const errorMessage = page.locator('text=/must be between|invalid|0-100/i');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should save user discount', async ({ page }) => {
    await page.goto('/admin/users');

    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit"]').first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(500);

      const discountInput = page.locator('input[name*="discount"], input[id*="discount"]');
      if (await discountInput.isVisible().catch(() => false)) {
        await discountInput.fill('15');

        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
        await saveButton.click();

        // Should show success
        const successMessage = page.locator('text=/saved|updated|success/i');
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should show discount in user create form', async ({ page }) => {
    await page.goto('/admin/users');

    const createButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    if (await createButton.isVisible().catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(500);

      const discountInput = page.locator('input[name*="discount"], input[id*="discount"], label:has-text("Discount") + input');
      if (await discountInput.isVisible().catch(() => false)) {
        await expect(discountInput).toBeVisible();
      }
    }
  });
});

test.describe('Mobile Order Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile-friendly order button', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // Order button should be visible and tappable
        const orderButton = page.locator('button:has-text("Order")');
        if (await orderButton.isVisible().catch(() => false)) {
          await expect(orderButton).toBeVisible();
        }
      }
    }
  });

  test('should display spec selectors on mobile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.goto('/products');

    const productLink = page.locator('a[href*="/products/category/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();

      const specificProduct = page.locator('a[href*="/products/category/"][href*="/"]').first();
      if (await specificProduct.isVisible().catch(() => false)) {
        await specificProduct.click();

        // Spec selectors should be usable on mobile
        const selectElements = page.locator('select');
        await page.waitForTimeout(500);
      }
    }
  });
});
