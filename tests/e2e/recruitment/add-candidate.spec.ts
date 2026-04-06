import { test, expect } from '../../../src/fixtures/base.fixture';
import { RecruitmentApi } from '../../../src/api/recruitment.api';
import { buildVacancy, buildCandidate } from '../../../src/factories/vacancy.factory';
import type { Vacancy, Candidate } from '../../../src/types/recruitment.types';

test.describe('Add Candidate', () => {
  let sharedVacancy: Vacancy;
  let sharedCandidate: Candidate;

  test.beforeAll(async ({ apiClient }) => {
    const recruitmentApi = new RecruitmentApi(apiClient);
    sharedVacancy = await recruitmentApi.createVacancy(buildVacancy(0));

    const candidatePayload = buildCandidate(sharedVacancy.id, 0);
    sharedCandidate = await recruitmentApi.createCandidate(candidatePayload);
  });

  test('should add a new candidate with required fields', async (
    { page, addCandidatePage },
    testInfo,
  ) => {
    const uniqueId = `${testInfo.parallelIndex}-${Date.now()}`;
    const firstName = `CandFirst${uniqueId}`;
    const lastName = `CandLast${uniqueId}`;
    const email = `cand-${uniqueId}@auto.test`;

    await page.goto('/web/index.php/recruitment/addCandidate');

    await addCandidatePage.fillCandidateForm(
      firstName,
      lastName,
      email,
      sharedVacancy.name,
    );
    await addCandidatePage.submit();

    await expect(page.getByText(firstName)).toBeVisible();
  });

  test('should search candidates by name', async ({ candidatesPage }) => {
    const firstName = sharedCandidate.firstName;

    await candidatesPage.goto();
    await candidatesPage.searchByName(firstName);

    const row = candidatesPage.getCandidateRow(firstName);
    await expect(row).toBeVisible();
  });

  test('should shortlist a candidate', async ({ page, candidatesPage }) => {
    const firstName = sharedCandidate.firstName;

    await candidatesPage.goto();
    await candidatesPage.searchByName(firstName);

    const row = candidatesPage.getCandidateRow(firstName);
    await row.getByRole('link').first().click();

    await page.getByRole('button', { name: 'Shortlist' }).click();

    // Confirm dialog if present
    const confirmButton = page.getByRole('button', { name: 'Yes, Shortlist' });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await expect(
      page.getByText('Shortlisted').or(page.getByText('Successfully Saved')),
    ).toBeVisible();
  });
});
