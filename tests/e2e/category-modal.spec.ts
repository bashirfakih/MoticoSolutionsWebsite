import { test, expect } from '@playwright/test';
import { CategoriesPage } from './pages/CategoriesPage';

test.describe('Category Modal Validation', () => {
  let categoriesPage: CategoriesPage;

  test.beforeEach(async ({ page }) => {
    categoriesPage = new CategoriesPage(page);
    await categoriesPage.navigate();
  });

  test('should show Add Category modal with required fields', async () => {
    await categoriesPage.openAddModal();

    await expect(categoriesPage.nameInput).toBeVisible();
    await expect(categoriesPage.slugInput).toBeVisible();
    await expect(categoriesPage.createBtn).toBeVisible();
    await expect(categoriesPage.cancelBtn).toBeVisible();
  });

  test('should disable Create button when name is empty', async () => {
    await categoriesPage.openAddModal();

    // Create button should be disabled without a name
    await expect(categoriesPage.createBtn).toBeDisabled();
  });

  test('should enable Create button after entering name', async () => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('Test Category');

    await expect(categoriesPage.createBtn).not.toBeDisabled();
  });

  test('should auto-generate slug from category name', async () => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('My Test Category');

    await expect(categoriesPage.slugInput).toHaveValue('my-test-category');
  });

  test('should close modal on Cancel', async () => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('Cancelled Category');
    await categoriesPage.cancel();

    await categoriesPage.expectModalClosed();

    // Data should not persist
    await expect(categoriesPage.page.locator('text=Cancelled Category')).not.toBeVisible();
  });

  test('should close modal on Escape key', async () => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('ESC Category');
    await categoriesPage.pressEscape();

    await categoriesPage.expectModalClosed();
  });

  test('should show error for duplicate slug', async () => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('Abrasive Belts');
    await categoriesPage.fillSlug('abrasive-belts');
    await categoriesPage.submitCreate();

    // Error message may appear as toast or inline
    await expect(
      categoriesPage.page.locator('text=/already exists|duplicate|unique/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should create category with icon and color', async () => {
    const uniqueName = `E2E Test ${Date.now()}`;
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName(uniqueName);
    await categoriesPage.selectIcon('Wrench');
    await categoriesPage.selectColor('Green');
    await categoriesPage.submitCreate();

    await categoriesPage.expectModalClosed();
    await expect(categoriesPage.page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 5000 });
  });

  test('should show loading spinner during save', async ({ page }) => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('Loading Test');

    // Intercept only POST requests to add delay
    await page.route('**/api/categories', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((r) => setTimeout(r, 1000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await categoriesPage.submitCreate();
    // Use .first() since there may be multiple spinners (page loader + button spinner)
    await expect(page.locator('.animate-spin').first()).toBeVisible({ timeout: 3000 });
  });

  test('should handle network error gracefully', async ({ page }) => {
    await categoriesPage.openAddModal();
    await categoriesPage.fillCategoryName('Network Error Test');

    // Abort only POST requests
    await page.route('**/api/categories', (route) => {
      if (route.request().method() === 'POST') {
        route.abort();
      } else {
        route.continue();
      }
    });
    await categoriesPage.submitCreate();

    await expect(page.locator('text=/failed|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('should open Edit modal with pre-filled data', async () => {
    await categoriesPage.editFirstCategory();
    await categoriesPage.expectModalOpen('Edit Category');

    // Name should be pre-filled (non-empty)
    const nameValue = await categoriesPage.nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test('should show delete confirmation dialog', async () => {
    await categoriesPage.deleteFirstCategory();

    await expect(categoriesPage.page.locator('text=Delete Category')).toBeVisible();
    await expect(categoriesPage.page.locator('text=Are you sure')).toBeVisible();

    // Cancel should close the dialog
    await categoriesPage.confirmDialogCancel.click();
    await expect(categoriesPage.page.locator('text=Delete Category')).not.toBeVisible();
  });
});
