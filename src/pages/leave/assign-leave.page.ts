import { type Page, type Locator } from '@playwright/test';

export class AssignLeavePage {
  readonly heading: Locator;
  readonly employeeNameInput: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly assignButton: Locator;
  readonly successToast: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Assign Leave' });
    // OrangeHRM employee name field uses a typeahead with placeholder text
    this.employeeNameInput = page.getByPlaceholder('Type for hints...');
    // Leave type uses OrangeHRM's custom oxd-select component
    this.leaveTypeDropdown = page
      .locator('.oxd-form-row')
      .filter({ hasText: 'Leave Type' })
      .locator('.oxd-select-text');
    this.fromDateInput = page.getByPlaceholder('yyyy-dd-mm').first();
    this.toDateInput = page.getByPlaceholder('yyyy-dd-mm').last();
    this.assignButton = page.getByRole('button', { name: 'Assign' });
    this.successToast = page.getByText('Successfully Saved');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/leave/assignLeave');
  }

  async assignLeave(
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
  ): Promise<void> {
    await this.employeeNameInput.fill(employeeName);
    await this.page.getByRole('option', { name: employeeName }).first().click();
    await this.leaveTypeDropdown.click();
    await this.page.getByRole('option', { name: leaveType }).first().click();
    await this.fromDateInput.fill(fromDate);
    await this.fromDateInput.press('Tab');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Tab');
  }

  async submit(): Promise<void> {
    await this.assignButton.click();
  }
}
