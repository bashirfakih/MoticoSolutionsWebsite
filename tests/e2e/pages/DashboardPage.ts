import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly statCards: Locator;
  readonly recentOrdersTable: Locator;
  readonly skeletonPulse: Locator;

  constructor(page: Page) {
    super(page);
    // Dashboard h1 says "Good morning/afternoon, Admin!" not "Dashboard"
    this.heading = page.locator('h1').first();
    this.statCards = page.locator('.bg-white.rounded-xl.border');
    this.recentOrdersTable = page.locator('table');
    this.skeletonPulse = page.locator('.animate-pulse');
  }

  async navigate() {
    await this.goto('/admin/dashboard');
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 15000 });
  }

  async expectStatsVisible() {
    await expect(this.statCards.first()).toBeVisible({ timeout: 10000 });
  }

  async getApiResponseTime(): Promise<number> {
    const start = Date.now();
    const response = await this.page.request.get('/api/dashboard/stats');
    const elapsed = Date.now() - start;
    expect(response.ok()).toBe(true);
    return elapsed;
  }
}
