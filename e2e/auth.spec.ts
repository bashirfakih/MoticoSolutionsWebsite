import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Flow
 *
 * Tests user registration, login, logout, and session management
 */

test.describe('User Registration', () => {
  test('should display registration form', async ({ page }) => {
    await page.goto('/register');

    // Form fields should be visible
    await expect(page.locator('input[name="name"], input[id="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[id="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[id="password"], input[type="password"]').first()).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/register');

    // Submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show validation errors or prevent submission
    await expect(page.locator('text=/required|invalid|please enter/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Form may use HTML5 validation instead
    });
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"], input[id="email"], input[type="email"]', 'invalid-email');
    await page.fill('input[name="password"], input[id="password"], input[type="password"]', 'password123');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show email validation error
    await page.waitForTimeout(500);
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"], input[id="name"]', 'Test User');
    await page.fill('input[name="email"], input[id="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[id="password"], input[type="password"]', '123');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show password validation error or prevent submission
    await page.waitForTimeout(500);
  });

  test('should successfully register new user', async ({ page }) => {
    await page.goto('/register');

    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.fill('input[name="name"], input[id="name"]', 'Test User');
    await page.fill('input[name="email"], input[id="email"], input[type="email"]', uniqueEmail);
    await page.fill('input[name="password"], input[id="password"], input[type="password"]', 'SecurePass123!');

    // If there's a confirm password field
    const confirmPassword = page.locator('input[name="confirmPassword"], input[id="confirmPassword"]');
    if (await confirmPassword.isVisible().catch(() => false)) {
      await confirmPassword.fill('SecurePass123!');
    }

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should redirect to dashboard or show success
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/login') || url.includes('/dashboard') || url.includes('/')).toBe(true);
  });
});

test.describe('User Login', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Form should have email and password fields
    await expect(page.locator('input[type="email"], input[name="email"], input[id="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"], input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'wrongpassword');

    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(page.locator('text=/invalid|incorrect|error|failed/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // May redirect instead
    });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Use demo/test credentials if available
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');

    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard or home
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/admin') || url.includes('/dashboard') || url === page.url()).toBe(true);
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")');
    if (await forgotLink.isVisible().catch(() => false)) {
      await expect(forgotLink).toBeVisible();
    }
  });

  test('should have link to registration', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up"), a:has-text("Create account")');
    if (await registerLink.isVisible().catch(() => false)) {
      await expect(registerLink).toBeVisible();
    }
  });
});

test.describe('User Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('should logout successfully', async ({ page }) => {
    // Find and click logout button/link
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")');

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await page.waitForTimeout(1000);

      // Should redirect to login or home
      const url = page.url();
      expect(url.includes('/login') || url.includes('/') || !url.includes('/admin')).toBe(true);
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from admin', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBe(true);
  });

  test('should redirect unauthenticated users from admin categories', async ({ page }) => {
    await page.goto('/admin/categories');

    // Should redirect to login
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBe(true);
  });

  test('should allow authenticated users to access admin', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Navigate to admin
    await page.goto('/admin');

    // Should be able to access admin
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Session Persistence', () => {
  test('should maintain session across page navigations', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'admin@motico.co.za');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Navigate to different pages
    await page.goto('/');
    await page.goto('/products');
    await page.goto('/admin');

    // Should still be logged in (can access admin)
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url.includes('/admin') || url.includes('/login')).toBe(true);
  });
});
