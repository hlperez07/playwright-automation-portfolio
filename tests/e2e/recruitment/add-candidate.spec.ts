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

    // OrangeHRM redirects to the candidate application page after save.
    // Wait for networkidle so the page fully renders before asserting.
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    // firstName appears in multiple places (Application Stage + Candidate Profile).
    await expect(page.getByText(firstName).first()).toBeVisible();
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
    // OrangeHRM candidates list Actions column: first button = eye (view), last = trash (delete).
    await row.getByRole('button').first().click();

    // OrangeHRM navigates to a "Shortlist Candidate" form page (not a dialog).
    // Click Shortlist, then Save on the form to confirm.
    await page.getByRole('button', { name: 'Shortlist' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // After Save, OrangeHRM processes the request and redirects back to the candidate
    // application page. Wait for all network activity to settle before asserting.
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    // OrangeHRM renders "Status: Shortlisted" as a subtitle paragraph on the candidate
    // application page. Using the full text avoids strict-mode violations from activity
    // log entries like "Shortlisted for <vacancy> by <user>" also on the page.
    await expect(page.getByText('Status: Shortlisted')).toBeVisible({ timeout: 15000 });
  });
});
