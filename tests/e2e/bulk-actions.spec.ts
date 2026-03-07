import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage';

test.describe('Bulk Actions', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await productsPage.navigate();
  });

  test('should show select-all checkbox in table header', async () => {
    await expect(productsPage.selectAllCheckbox).toBeVisible();
  });

  test('should select individual products via checkbox', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectProductByIndex(0);

    // Bulk Actions button should appear when items are selected
    await expect(productsPage.bulkActionsBtn).toBeVisible();
  });

  test('should select all products with select-all checkbox', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectAllProducts();

    // Bulk Actions should become available
    await expect(productsPage.bulkActionsBtn).toBeVisible();
  });

  test('should deselect all when select-all is unchecked', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectAllProducts();
    await expect(productsPage.bulkActionsBtn).toBeVisible();

    // Uncheck select-all (React controlled — use click)
    await productsPage.selectAllCheckbox.click();

    // Bulk actions should disappear
    await expect(productsPage.bulkActionsBtn).not.toBeVisible({ timeout: 3000 });
  });

  test('should open bulk actions dropdown menu', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectProductByIndex(0);
    await productsPage.openBulkActions();

    // Menu should show Publish, Unpublish, Delete options
    await expect(productsPage.page.locator('text=Publish')).toBeVisible();
    await expect(productsPage.page.locator('text=Delete')).toBeVisible();
  });

  test('should bulk publish selected products', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectProductByIndex(0);

    // Intercept the PATCH request
    const patchPromise = page.waitForRequest(
      (req) => req.method() === 'PATCH' && req.url().includes('/api/products/'),
      { timeout: 10000 }
    );

    await productsPage.bulkPublish();

    await patchPromise;
    await productsPage.expectToastSuccess(/published/i);
  });

  test('should bulk unpublish selected products', async ({ page }) => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectProductByIndex(0);

    const patchPromise = page.waitForRequest(
      (req) => req.method() === 'PATCH' && req.url().includes('/api/products/'),
      { timeout: 10000 }
    );

    await productsPage.bulkUnpublish();

    await patchPromise;
    await productsPage.expectToastSuccess(/unpublished/i);
  });

  test('should show confirmation before bulk delete', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectProductByIndex(0);
    await productsPage.bulkDelete();

    // Confirmation dialog should appear
    await expect(productsPage.deleteDialog).toBeVisible();
  });

  test('should clear selection after bulk action', async () => {
    const count = await productsPage.getProductCount();
    test.skip(count === 0, 'No products available');

    await productsPage.selectProductByIndex(0);
    await expect(productsPage.bulkActionsBtn).toBeVisible();

    await productsPage.bulkPublish();
    await productsPage.page.waitForTimeout(1000);

    // Selection should be cleared
    await expect(productsPage.bulkActionsBtn).not.toBeVisible({ timeout: 5000 });
  });
});
