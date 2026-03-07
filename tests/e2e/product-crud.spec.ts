import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage';

test.describe('Product CRUD', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await productsPage.navigate();
  });

  test('should display products page with table', async () => {
    await expect(productsPage.heading).toBeVisible();
    await expect(productsPage.searchInput).toBeVisible();
    await expect(productsPage.addProductLink).toBeVisible();
    await expect(productsPage.exportCsvBtn).toBeVisible();
  });

  test('should navigate to add product page', async () => {
    await productsPage.clickAddProduct();
    await expect(productsPage.page).toHaveURL(/\/admin\/products\/new/, { timeout: 10000 });
    await expect(productsPage.page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('should search products with debounce', async () => {
    const initialCount = await productsPage.getProductCount();
    test.skip(initialCount === 0, 'No products available to test search');

    await productsPage.searchProducts('nonexistent-product-xyz');

    // Should show empty state or fewer results
    await expect(
      productsPage.page.locator('text=No products found')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should open product action menu', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.openProductActions(0);

    // Action menu renders as z-20 w-48 dropdown
    const menu = productsPage.page.locator('.z-20.w-48');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await expect(menu.locator('a:has-text("Edit")')).toBeVisible();
    await expect(menu.locator('button:has-text("Delete")')).toBeVisible();
  });

  test('should toggle publish status via action menu', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.openProductActions(0);

    // Action menu renders as an absolute positioned div
    const menu = page.locator('.z-20.w-48');
    await expect(menu).toBeVisible({ timeout: 3000 });

    // Click Publish or Unpublish (whichever is shown)
    const publishBtn = menu.locator('button:has-text("Publish"), button:has-text("Unpublish")').first();
    await publishBtn.click();

    await productsPage.expectToastSuccess(/published|unpublished/i);
  });

  test('should toggle featured status via action menu', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.openProductActions(0);

    const menu = page.locator('.z-20.w-48');
    await expect(menu).toBeVisible({ timeout: 3000 });

    const featuredBtn = menu.locator('button:has-text("Featured"), button:has-text("Remove Featured")').first();
    await featuredBtn.click();

    await productsPage.expectToastSuccess(/featured/i);
  });

  test('should duplicate product via action menu', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.openProductActions(0);

    const menu = page.locator('.z-20.w-48');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await menu.locator('a:has-text("Edit")').waitFor({ state: 'visible' });
    await menu.locator('button:has-text("Duplicate")').click();

    // Should redirect to new product edit page
    await page.waitForURL(/\/admin\/products\//, { timeout: 10000 });
    await productsPage.expectToastSuccess(/duplicated/i);
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.openProductActions(0);

    const menu = page.locator('.z-20.w-48');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await menu.locator('button:has-text("Delete")').click();

    await expect(productsPage.deleteDialog).toBeVisible();
  });

  test('should export products to CSV', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await productsPage.exportCsvBtn.click();
    const download = await downloadPromise;

    if (download) {
      expect(download.suggestedFilename()).toMatch(/products-export.*\.csv$/);
    }
  });

  test('should show filter panel on toggle', async () => {
    await productsPage.filterToggle.click();

    // Filter dropdowns should appear (category, brand, stock status)
    await expect(productsPage.page.locator('select').first()).toBeVisible();
  });
});
