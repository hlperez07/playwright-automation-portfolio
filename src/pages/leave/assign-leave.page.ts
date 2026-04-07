import { type Page, type Locator } from '@playwright/test';
import { OxdLocators, OrangeHrmCommon } from '../../locators/orangehrm.locators';
import { AssignLeaveLocators } from '../../locators/assign-leave.locators';

export class AssignLeavePage {
  readonly heading: Locator;
  readonly employeeNameInput: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly assignButton: Locator;
  readonly successToast: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: AssignLeaveLocators.headingName });
    // OrangeHRM employee name field uses a typeahead with placeholder text
    this.employeeNameInput = page.getByPlaceholder(OrangeHrmCommon.typeaheadPlaceholder);
    // Leave type uses OrangeHRM's custom oxd-select component
    this.leaveTypeDropdown = page
      .locator(OxdLocators.formRow)
      .filter({ hasText: AssignLeaveLocators.leaveTypeRowText })
      .locator(OxdLocators.selectText);
    // Assign Leave date inputs use mm-dd-yyyy placeholder (different from Apply Leave's yyyy-dd-mm).
    this.fromDateInput = page.getByPlaceholder(AssignLeaveLocators.datePlaceholder).first();
    this.toDateInput = page.getByPlaceholder(AssignLeaveLocators.datePlaceholder).last();
    this.assignButton = page.getByRole('button', { name: AssignLeaveLocators.assignButton });
    this.successToast = page.getByText(OrangeHrmCommon.successToastText);
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/leave/assignLeave');
  }

  /** Waits for the form's async data loader to clear before interactions begin. */
  async waitForReady(): Promise<void> {
    await this.page.locator(OxdLocators.formLoader).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
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
    // OrangeHRM's custom select has no role="listbox". Scope to the dropdown CSS class.
    await this.page.locator(OxdLocators.selectDropdown).getByRole('option', { name: leaveType }).first().click();
    // OrangeHRM re-fetches duration/balance after leave type selection — wait for the
    // loader to clear before trying to fill the date inputs.
    await this.page.locator(OxdLocators.formLoader).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.fromDateInput.fill(fromDate);
    await this.fromDateInput.press('Tab');
    await this.toDateInput.fill(toDate);
    await this.toDateInput.press('Tab');
  }

  async submit(): Promise<void> {
    await this.assignButton.click();
  }
}
