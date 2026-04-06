import { type Page, type Locator } from '@playwright/test';

export class AddEmployeePage {
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  /**
   * OrangeHRM "Create Login Details" is a custom toggle switch rendered as
   * a <span class="oxd-switch-input"> inside a label — not a standard checkbox.
   * getByRole('switch') does not resolve it; we use the label text to scope the click.
   */
  readonly createLoginDetailsToggle: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = page.locator('form').getByRole('textbox').filter({ hasText: '' }).nth(3);
    // Toggle switch: scoped to the label containing the "Create Login Details" text
    this.createLoginDetailsToggle = page
      .locator('label')
      .filter({ hasText: 'Create Login Details' })
      .locator('span.oxd-switch-input');
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.successToast = page.getByText('Successfully Saved');
  }

  async fillMandatoryFields(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
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
