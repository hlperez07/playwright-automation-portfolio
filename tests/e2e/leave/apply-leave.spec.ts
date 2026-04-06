import { test, expect } from '../../../src/fixtures/base.fixture';
import { EmployeesApi } from '../../../src/api/employees.api';
import { LeaveApi } from '../../../src/api/leave.api';
import { buildEmployee } from '../../../src/factories/employee.factory';

function getNextMonday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay() + 1) % 7 || 7));
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

test.describe('Apply Leave', () => {
  test('should apply for leave successfully', async ({ page }) => {
    const futureDate = getNextMonday();

    await page.goto('/web/index.php/leave/applyLeave');

    // Select first available leave type from the custom dropdown
    const leaveTypeDropdown = page
      .locator('.oxd-form-row')
      .filter({ hasText: 'Leave Type' })
      .locator('.oxd-select-text');
    await leaveTypeDropdown.click();
    await page.getByRole('option').first().click();

    // Fill From Date and To Date
    const dateInputs = page.getByPlaceholder('yyyy-dd-mm');
    await dateInputs.first().fill(futureDate);
    await dateInputs.first().press('Tab');
    await dateInputs.last().fill(futureDate);
    await dateInputs.last().press('Tab');

    await page.getByRole('button', { name: 'Apply' }).click();

    await expect(page.getByText('Successfully Saved')).toBeVisible();
  });

  test('should assign leave to an employee as admin', async (
    { page, assignLeavePage, apiClient },
    testInfo,
  ) => {
    const employeesApi = new EmployeesApi(apiClient);
    const leaveApi = new LeaveApi(apiClient);

    const employee = await employeesApi.create(buildEmployee(testInfo.parallelIndex));
    const leaveTypes = await leaveApi.getLeaveTypes();
    expect(leaveTypes.length).toBeGreaterThan(0);

    const futureDate = getNextMonday();
    const fullName = `${employee.firstName} ${employee.lastName}`;

    await assignLeavePage.goto();
    await assignLeavePage.assignLeave(
      fullName,
      leaveTypes[0].name,
      futureDate,
      futureDate,
    );
    await assignLeavePage.submit();

    await expect(assignLeavePage.successToast).toBeVisible();
  });
});
