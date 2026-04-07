import { type Page, type Locator } from '@playwright/test';
import { OxdLocators, OrangeHrmCommon } from '../../locators/orangehrm.locators';
import { AddCandidateLocators } from '../../locators/add-candidate.locators';

export class AddCandidatePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly vacancyDropdown: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: AddCandidateLocators.headingName });
    this.firstNameInput = page.getByPlaceholder(AddCandidateLocators.firstNamePlaceholder);
    this.lastNameInput = page.getByPlaceholder(AddCandidateLocators.lastNamePlaceholder);
    // OrangeHRM candidate form: Email and Contact Number both use 'Type here' placeholder.
    // Email comes first in DOM order — first() targets the Email field.
    this.emailInput = page.getByPlaceholder(AddCandidateLocators.emailPlaceholder).first();
    // OrangeHRM uses a custom oxd-select component for vacancy selection
    this.vacancyDropdown = page
      .locator(OxdLocators.formRow)
      .filter({ hasText: AddCandidateLocators.vacancyRowText })
      .locator(OxdLocators.selectText);
    this.saveButton = page.getByRole('button', { name: OrangeHrmCommon.saveButton });
    this.successToast = page.getByText(OrangeHrmCommon.successToastText);
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
