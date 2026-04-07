import { type Page, type Locator } from '@playwright/test';
import { OrangeHrmCommon } from '../../locators/orangehrm.locators';
import { CandidatesLocators } from '../../locators/candidates.locators';

export class CandidatesPage {
  readonly heading: Locator;
  readonly candidateNameInput: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly recordsTable: Locator;
  readonly noRecordsMessage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: CandidatesLocators.headingName });
    this.candidateNameInput = page.getByPlaceholder(OrangeHrmCommon.typeaheadPlaceholder);
    this.searchButton = page.getByRole('button', { name: OrangeHrmCommon.searchButton });
    this.addButton = page.getByRole('button', { name: OrangeHrmCommon.addButton });
    this.recordsTable = page.getByRole('table');
    this.noRecordsMessage = page.getByText(OrangeHrmCommon.noRecordsText);
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/recruitment/viewCandidates');
  }

  async searchByName(name: string): Promise<void> {
    await this.candidateNameInput.fill(name);
    await this.page.getByRole('option', { name }).first().click();
    await this.searchButton.click();
  }

  async clickAddCandidate(): Promise<void> {
    await this.addButton.click();
  }

  getCandidateRow(name: string): Locator {
    return this.recordsTable.getByRole('row').filter({ hasText: name });
  }
}
