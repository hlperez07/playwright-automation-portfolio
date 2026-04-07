import { test, expect } from '../../../src/fixtures/base.fixture';
import { RecruitmentApi } from '../../../src/api/recruitment.api';
import { EmployeesApi } from '../../../src/api/employees.api';
import { buildVacancy } from '../../../src/factories/vacancy.factory';

test.describe('Vacancies', () => {
  test('should create a new vacancy', async ({ page, apiClient }, testInfo) => {
    const uniqueId = `${testInfo.parallelIndex}-${Date.now()}`;
    const vacancyName = `AutoVacancy-${uniqueId}`;

    // Fetch first available employee to use as Hiring Manager (required field).
    const employeesApi = new EmployeesApi(apiClient);
    const { data: employees } = await employeesApi.list({ limit: 1 });
    // Filter active (non-terminated) employees — terminated employees show as "Invalid"
    // in the Hiring Manager autocomplete. Construct display name from parts because
    // fullName may be absent from the list API response on some demo versions.
    const activeEmployee = employees.find(e => e.terminationId === null) ?? employees[0];
    const hiringManagerName = [activeEmployee.firstName, activeEmployee.middleName, activeEmployee.lastName]
      .filter(Boolean)
      .join(' ');

    await page.goto('/web/index.php/recruitment/addJobVacancy');

    // OrangeHRM's Vacancy Name field has no placeholder and no formal label association.
    // Scope to .oxd-form to avoid matching the global search bar in the sidebar.
    await page.locator('.oxd-form').getByRole('textbox').first().fill(vacancyName);

    // Select first available job title from the custom dropdown.
    // Add Vacancy has exactly one .oxd-select-text (Job Title); no row filter needed.
    // Wait for network idle so OrangeHRM's async job-title fetch completes first.
    await page.waitForLoadState('networkidle');
    const jobTitleDropdown = page.locator('.oxd-select-text').first();
    await jobTitleDropdown.click();
    await page.locator('.oxd-select-dropdown').waitFor({ state: 'visible', timeout: 10000 });
    // nth(0) is always the "-- Select --" placeholder — skip it to pick the first real job title.
    await page.locator('.oxd-select-dropdown').getByRole('option').nth(1).click();
    // Wait for the select dropdown to fully close before proceeding; leftover visible
    // [role="option"] elements from it would pollute the hiring manager option locator.
    await page.locator('.oxd-select-dropdown').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    // Hiring Manager is required. pressSequentially fires real keyup events (fill does not)
    // which trigger OrangeHRM's employee search. Use the full name to match searchByName's
    // pattern — the same approach that works for the employee list search typeahead.
    const hiringManagerInput = page.locator('.oxd-form').getByPlaceholder('Type for hints...');
    await hiringManagerInput.pressSequentially(activeEmployee.firstName, { delay: 50 });
    await page.getByRole('option', { name: hiringManagerName }).first().click();

    await page.getByRole('button', { name: 'Save' }).click();

    // After save OrangeHRM shows a "Successfully Saved" toast then redirects to the Edit
    // Vacancy page. The toast is transient and may disappear before assertion — the stable
    // "Edit Vacancy" heading is an equally valid proof that the vacancy was created.
    await expect(
      page.getByText('Successfully Saved').or(page.getByRole('heading', { name: 'Edit Vacancy' })),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should view vacancy details', async ({ page, apiClient }, testInfo) => {
    const recruitmentApi = new RecruitmentApi(apiClient);
    const vacancyPayload = buildVacancy(testInfo.parallelIndex);
    const vacancy = await recruitmentApi.createVacancy(vacancyPayload);

    await page.goto('/web/index.php/recruitment/viewJobVacancy');

    // The list may span many pages. Use the Vacancy filter to narrow to our specific vacancy.
    // All 4 filter dropdowns (Job Title, Vacancy, Hiring Manager, Status) sit in the SAME
    // .oxd-form-row, so nth(1) targets the Vacancy dropdown (0 = Job Title).
    const vacancyFilter = page
      .locator('.oxd-form-row')
      .filter({ hasText: 'Vacancy' })
      .locator('.oxd-select-text')
      .nth(1);
    await vacancyFilter.click();
    await page.locator('.oxd-select-dropdown').getByRole('option', { name: vacancy.name }).click();
    await page.getByRole('button', { name: 'Search' }).click();

    const row = page.getByRole('row').filter({ hasText: vacancy.name });
    await expect(row).toBeVisible();
  });
});
