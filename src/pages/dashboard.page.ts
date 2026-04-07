import { type Page, type Locator } from '@playwright/test';
import { DashboardLocators } from '../locators/dashboard.locators';

export class DashboardPage {
  readonly heading: Locator;
  readonly logoutMenuItem: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: DashboardLocators.headingName });
    this.logoutMenuItem = page.getByRole('menuitem', { name: DashboardLocators.logoutMenuItemName });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index');
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async logout(): Promise<void> {
    // OrangeHRM places the user dropdown in the top-right banner; click the user name to open it
    await this.page.getByRole('banner').getByText(DashboardLocators.userBannerText).click();
    await this.logoutMenuItem.click();
  }
}
