import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly heading: Locator;
  readonly logoutMenuItem: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index');
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async logout(): Promise<void> {
    // OrangeHRM places the user dropdown in the top-right banner; click the user name to open it
    await this.page.getByRole('banner').getByText('Admin').click();
    await this.logoutMenuItem.click();
  }
}
