import { type Page, type Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly toastSuccess: Locator;
  readonly toastError: Locator;
  readonly confirmDialog: Locator;
  readonly confirmDialogConfirm: Locator;
  readonly confirmDialogCancel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toastSuccess = page.locator('div[role="alert"].bg-green-50');
    this.toastError = page.locator('div[role="alert"].bg-red-50');
    this.confirmDialog = page.locator('div[role="dialog"][aria-modal="true"]');
    this.confirmDialogConfirm = this.confirmDialog.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    this.confirmDialogCancel = this.confirmDialog.locator('button:has-text("Cancel")');
  }

  async goto(path: string) {
    await this.page.goto(path);
    await this.dismissCookieBanner();
  }

  async dismissCookieBanner() {
    const acceptBtn = this.page.locator('button:has-text("Accept All")');
    if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptBtn.click();
      await acceptBtn.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }
  }

  async expectToastSuccess(text?: string | RegExp) {
    const toast = this.page.locator('div[role="alert"]').filter({ hasText: text ?? /./  });
    await expect(toast.first()).toBeVisible({ timeout: 5000 });
  }

  async expectToastError(text?: string | RegExp) {
    const toast = this.toastError;
    await expect(toast.first()).toBeVisible({ timeout: 5000 });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }
}
