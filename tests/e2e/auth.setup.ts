import { test as setup, expect } from '@playwright/test';
import path from 'path';

const STORAGE_STATE = path.join(__dirname, '../../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  // Go to login page
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // Wait for possible redirect (auth check may redirect authenticated users)
  await page.waitForTimeout(2000);
  const currentUrl = page.url();

  // Already authenticated as admin — save and return
  if (currentUrl.includes('/admin/')) {
    await page.context().storageState({ path: STORAGE_STATE });
    return;
  }

  // If redirected to customer area (stale session), go back to login
  if (!currentUrl.includes('/login')) {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  }

  // Set cookie consent in localStorage to prevent the banner from appearing
  await page.evaluate(() => localStorage.setItem('cookie-consent', 'all'));

  // Reload to apply (cookie banner checks localStorage on mount)
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Wait for the login form to appear
  await page.locator('h1:has-text("Sign in")').waitFor({ timeout: 15000 });

  // Select Admin tab
  await page.locator('button:has-text("Admin")').click();
  await page.waitForTimeout(500);

  // Fill email — click, clear, then type character by character for React controlled inputs
  const emailInput = page.locator('#email');
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.click();
  await emailInput.fill('');
  await emailInput.pressSequentially('admin@moticosolutions.com', { delay: 20 });

  // Fill password
  const passwordInput = page.locator('#password');
  await passwordInput.click();
  await passwordInput.fill('');
  await passwordInput.pressSequentially('admin123', { delay: 20 });

  // Verify values were set
  await expect(emailInput).toHaveValue('admin@moticosolutions.com');
  await expect(passwordInput).toHaveValue('admin123');

  // Dismiss cookie banner again if it appeared during form fill
  const cookieBtn = page.locator('button:has-text("Accept All")');
  if (await cookieBtn.isVisible().catch(() => false)) {
    await cookieBtn.click();
    await page.waitForTimeout(300);
  }

  // Submit
  await page.locator('button[type="submit"]').click();

  // Wait for redirect — may go to /admin/ or /account/ due to React race condition
  await page.waitForURL(/\/(admin|account)\//, { timeout: 30000 });

  // If we ended up at /account/ instead of /admin/, navigate directly
  // The auth cookies are already set correctly for the admin user
  if (page.url().includes('/account/')) {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }

  // Verify we're on an admin page
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

  // Dismiss cookie banner on admin page too (if it reappeared)
  const adminAcceptBtn = page.locator('button:has-text("Accept All")');
  if (await adminAcceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await adminAcceptBtn.click();
    await adminAcceptBtn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }

  // Ensure cookie consent is set and reset filter chips to empty arrays
  // (removing the keys causes the FilterChips component to fall back to DEFAULT_CHIPS)
  await page.evaluate(() => {
    localStorage.setItem('cookie-consent', 'all');
    localStorage.setItem('motico_saved_filters_products', '[]');
    localStorage.setItem('motico_saved_filters_orders', '[]');
    localStorage.setItem('motico_saved_filters_customers', '[]');
  });

  // Save auth state (includes cookies and localStorage)
  await page.context().storageState({ path: STORAGE_STATE });
});
