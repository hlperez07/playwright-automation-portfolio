import { type Page, type Locator } from '@playwright/test';
import { OxdLocators, OrangeHrmCommon } from '../../locators/orangehrm.locators';
import { AddEmployeeLocators } from '../../locators/add-employee.locators';

export class AddEmployeePage {
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  /**
   * OrangeHRM "Create Login Details" is a custom toggle switch rendered as
   * a <span class="oxd-switch-input"> inside a label — not a standard checkbox.
   * getByRole('switch') does not resolve it; we use the OxdLocators class selector.
   */
  readonly createLoginDetailsToggle: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder(AddEmployeeLocators.firstNamePlaceholder);
    this.middleNameInput = page.getByPlaceholder(AddEmployeeLocators.middleNamePlaceholder);
    this.lastNameInput = page.getByPlaceholder(AddEmployeeLocators.lastNamePlaceholder);
    this.employeeIdInput = page.locator('form').getByRole('textbox').filter({ hasText: '' }).nth(3);
    this.createLoginDetailsToggle = page.locator(OxdLocators.switchInput);
    // OrangeHRM does not formally associate the Username label with a <label for="...">.
    // Scope to the form-row that carries the "Username" text and grab its textbox.
    this.usernameInput = page
      .locator(OxdLocators.formRow)
      .filter({ hasText: AddEmployeeLocators.usernameRowText })
      .getByRole('textbox');
    // Password and Confirm Password share one oxd-form-row. The two inputs in that row
    // are Password (first) and Confirm Password (last).
    this.passwordInput = page
      .locator(OxdLocators.formRow)
      .filter({ hasText: AddEmployeeLocators.confirmPasswordRowText })
      .getByRole('textbox')
      .first();
    this.confirmPasswordInput = page
      .locator(OxdLocators.formRow)
      .filter({ hasText: AddEmployeeLocators.confirmPasswordRowText })
      .getByRole('textbox')
      .last();
    this.saveButton = page.getByRole('button', { name: OrangeHrmCommon.saveButton });
    this.successToast = page.getByText(OrangeHrmCommon.successToastText);
  }

  async fillMandatoryFields(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    // OrangeHRM auto-generates a sequential Employee ID (e.g. "0490") that conflicts after
    // many test runs. Override it with a timestamp-based value to guarantee uniqueness.
    await this.employeeIdInput.clear();
    await this.employeeIdInput.fill(String(Date.now() % 100000).padStart(5, '0'));
  }

  async enableLoginDetails(username: string, password: string): Promise<void> {
    await this.createLoginDetailsToggle.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
