import { test, expect } from '../../../src/fixtures/base.fixture';
import { EmployeesApi } from '../../../src/api/employees.api';
import { buildEmployee } from '../../../src/factories/employee.factory';

test.describe('Add Employee', () => {
  test('should add a new employee with first and last name only', async (
    { page, addEmployeePage },
    testInfo,
  ) => {
    const uniqueId = `${testInfo.parallelIndex}-${Date.now()}`;
    const firstName = `AutoFirst${uniqueId}`;
    const lastName = `AutoLast${uniqueId}`;

    await page.goto('/web/index.php/pim/addEmployee');

    await addEmployeePage.fillMandatoryFields(firstName, lastName);
    await addEmployeePage.save();

    await expect(page).toHaveURL(/\/viewPersonalDetails/);
    await expect(page.getByText(firstName)).toBeVisible();
  });

  test('should add employee with login credentials enabled', async (
    { page, addEmployeePage },
    testInfo,
  ) => {
    const uniqueId = `${testInfo.parallelIndex}-${Date.now()}`;
    const firstName = `AutoFirst${uniqueId}`;
    const lastName = `AutoLast${uniqueId}`;
    const username = `autouser${uniqueId}`;
    const password = 'Test@12345!';

    await page.goto('/web/index.php/pim/addEmployee');

    await addEmployeePage.fillMandatoryFields(firstName, lastName);
    await addEmployeePage.enableLoginDetails(username, password);
    await addEmployeePage.save();

    await expect(page).toHaveURL(/\/viewPersonalDetails/);
  });

  test('should delete an existing employee', async (
    { page, employeeListPage, apiClient },
    testInfo,
  ) => {
    const employeesApi = new EmployeesApi(apiClient);
    const payload = buildEmployee(testInfo.parallelIndex);
    const employee = await employeesApi.create(payload);

    await employeeListPage.goto();
    await employeeListPage.searchByName(employee.lastName);

    const row = employeeListPage.getEmployeeRow(employee.lastName);
    await row.getByRole('button').filter({ has: page.locator('i.bi-trash') }).click();
    await page.getByRole('button', { name: 'Yes, Delete' }).click();

    await expect(page.getByText('Successfully Deleted')).toBeVisible();
  });
});
