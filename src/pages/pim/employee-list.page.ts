import { type Page, type Locator } from '@playwright/test';

export class EmployeeListPage {
  readonly heading: Locator;
  readonly employeeNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly recordsTable: Locator;
  readonly noRecordsMessage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Employee Information' });
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    this.employeeIdInput = page.getByRole('textbox', { name: 'Employee Id' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.recordsTable = page.getByRole('table');
    this.noRecordsMessage = page.getByText('No Records Found');
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
