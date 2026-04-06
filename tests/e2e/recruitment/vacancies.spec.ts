import { test, expect } from '../../../src/fixtures/base.fixture';
import { RecruitmentApi } from '../../../src/api/recruitment.api';
import { buildVacancy } from '../../../src/factories/vacancy.factory';

test.describe('Vacancies', () => {
  test('should create a new vacancy', async ({ page }, testInfo) => {
    const uniqueId = `${testInfo.parallelIndex}-${Date.now()}`;
    const vacancyName = `AutoVacancy-${uniqueId}`;

    await page.goto('/web/index.php/recruitment/addJobVacancy');

    await page.getByRole('textbox', { name: 'Vacancy Name' }).fill(vacancyName);

    // Select first available job title from the custom dropdown
    const jobTitleDropdown = page
      .locator('.oxd-form-row')
      .filter({ hasText: 'Job Title' })
      .locator('.oxd-select-text');
    await jobTitleDropdown.click();
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully Saved')).toBeVisible();
  });

  test('should view vacancy details', async ({ page, apiClient }, testInfo) => {
    const recruitmentApi = new RecruitmentApi(apiClient);
    const vacancyPayload = buildVacancy(testInfo.parallelIndex);
    const vacancy = await recruitmentApi.createVacancy(vacancyPayload);

    await page.goto('/web/index.php/recruitment/viewJobVacancy');

    const row = page.getByRole('row').filter({ hasText: vacancy.name });
    await row.getByRole('link').first().click();

    await expect(page.getByText(vacancy.name)).toBeVisible();
  });
});
