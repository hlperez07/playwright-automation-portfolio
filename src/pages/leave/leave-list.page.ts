import { type Page, type Locator } from '@playwright/test';
import { OxdLocators, OrangeHrmCommon } from '../../locators/orangehrm.locators';
import { LeaveListLocators } from '../../locators/leave-list.locators';

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
    this.heading = page.getByRole('heading', { name: LeaveListLocators.headingName });
    this.searchButton = page.getByRole('button', { name: OrangeHrmCommon.searchButton });
    this.recordsTable = page.getByRole('table');
    // Scope to the span variant (content area) to avoid matching the transient
    // "No Records Found" toast notification which OrangeHRM also shows at the same time.
    this.noRecordsMessage = page.locator(OxdLocators.contentSpan).filter({ hasText: /^No Records Found$/ });
    // Leave List form has two rows containing 'Show Leave with Status' text.
    // first() selects the row with the status dropdown.
    this.statusDropdown = page
      .locator(OxdLocators.formRow)
      .filter({ hasText: LeaveListLocators.statusRowText })
      .locator(OxdLocators.selectText)
      .first();
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
