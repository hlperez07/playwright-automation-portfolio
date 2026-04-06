import { type Page, type Locator } from '@playwright/test';

export class LeaveListPage {
  readonly heading: Locator;
  readonly searchButton: Locator;
  readonly recordsTable: Locator;
  readonly noRecordsMessage: Locator;
  /**
   * OrangeHRM uses a custom Vue-based dropdown component (oxd-select).
   * The visible text "Show Leave with Status" lives in a sibling — we scope
   * to the parent form group and then grab the custom select input.
   */
  readonly statusDropdown: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Leave List' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordsTable = page.getByRole('table');
    this.noRecordsMessage = page.getByText('No Records Found');
    this.statusDropdown = page
      .locator('.oxd-form-row')
      .filter({ hasText: 'Show Leave with Status' })
      .locator('.oxd-select-text');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList');
  }

  async search(): Promise<void> {
    await this.searchButton.click();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusDropdown.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.searchButton.click();
  }

  getLeaveRow(employeeName: string): Locator {
    return this.recordsTable.getByRole('row').filter({ hasText: employeeName });
  }
}
