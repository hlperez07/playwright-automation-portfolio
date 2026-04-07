import { type Page, type Locator } from '@playwright/test';
import { OrangeHrmCommon } from '../../locators/orangehrm.locators';
import { EmployeeListLocators } from '../../locators/employee-list.locators';

export class EmployeeListPage {
  readonly heading: Locator;
  readonly employeeNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly recordsTable: Locator;
  readonly noRecordsMessage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: EmployeeListLocators.headingName });
    // Employee List has two 'Type for hints...' inputs (Employee Name + Supervisor Name).
    // first() targets Employee Name — the top search field.
    this.employeeNameInput = page.getByPlaceholder(OrangeHrmCommon.typeaheadPlaceholder).first();
    this.employeeIdInput = page.getByRole('textbox', { name: EmployeeListLocators.employeeIdTextboxName });
    this.searchButton = page.getByRole('button', { name: OrangeHrmCommon.searchButton });
    this.addButton = page.getByRole('button', { name: OrangeHrmCommon.addButton });
    this.recordsTable = page.getByRole('table');
    // OrangeHRM may render the "No Records Found" message more than once.
    this.noRecordsMessage = page.getByText(OrangeHrmCommon.noRecordsText).first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
  }

  /**
   * Searches by name using OrangeHRM's autocomplete.
   * Waits for and selects the first suggestion before clicking Search.
   */
  async searchByName(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
    await this.page.getByRole('option', { name }).first().click();
    await this.searchButton.click();
  }

  /**
   * Types directly and submits search without waiting for autocomplete suggestions.
   * Use when verifying no results exist for an unknown name.
   */
  async searchByNameDirect(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
  }

  getEmployeeRow(name: string): Locator {
    return this.recordsTable.getByRole('row').filter({ hasText: name });
  }

  async getResultCount(): Promise<number> {
    const rows = this.recordsTable.getByRole('row');
    const count = await rows.count();
    return Math.max(0, count - 1); // subtract header row
  }
}
