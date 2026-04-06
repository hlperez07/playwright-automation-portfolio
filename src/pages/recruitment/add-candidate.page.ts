import { type Page, type Locator } from '@playwright/test';

export class AddCandidatePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly vacancyDropdown: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Add Candidate' });
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    // OrangeHRM uses a custom oxd-select component for vacancy selection
    this.vacancyDropdown = page
      .locator('.oxd-form-row')
      .filter({ hasText: 'Vacancy' })
      .locator('.oxd-select-text');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.successToast = page.getByText('Successfully Saved');
  }

  async fillCandidateForm(
    firstName: string,
    lastName: string,
    email: string,
    vacancyName: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.vacancyDropdown.click();
    await this.page.getByRole('option', { name: vacancyName }).first().click();
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
  }
}
