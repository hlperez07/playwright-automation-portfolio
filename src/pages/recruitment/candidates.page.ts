import { type Page, type Locator } from '@playwright/test';

export class CandidatesPage {
  readonly heading: Locator;
  readonly candidateNameInput: Locator;
  readonly searchButton: Locator;
  readonly addButton: Locator;
  readonly recordsTable: Locator;
  readonly noRecordsMessage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Candidates' });
    this.candidateNameInput = page.getByPlaceholder('Type for hints...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.recordsTable = page.getByRole('table');
    this.noRecordsMessage = page.getByText('No Records Found');
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
