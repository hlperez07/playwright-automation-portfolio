import { test, expect } from '../../../src/fixtures/base.fixture';
import { EmployeesApi } from '../../../src/api/employees.api';
import { buildEmployee } from '../../../src/factories/employee.factory';
import type { Employee } from '../../../src/types/employee.types';

test.describe('Search Employee', () => {
  let createdEmployee: Employee;

  test.beforeAll(async ({ apiClient }) => {
    const employeesApi = new EmployeesApi(apiClient);
    const payload = buildEmployee(0);
    createdEmployee = await employeesApi.create(payload);
  });

  test('should find employee by exact name', async ({ employeeListPage }) => {
    await employeeListPage.goto();
    await employeeListPage.searchByName(createdEmployee.firstName);

    const row = employeeListPage.getEmployeeRow(createdEmployee.firstName);
    await expect(row).toBeVisible();
  });

  test('should find employee by partial name', async ({ employeeListPage }) => {
    await employeeListPage.goto();

    await employeeListPage.employeeNameInput.fill('AutoFirst');
    await employeeListPage.searchButton.click();

    await expect(employeeListPage.recordsTable.getByRole('row').nth(1)).toBeVisible();
  });

  test('should show no results for non-existent name', async ({ employeeListPage }) => {
    await employeeListPage.goto();
    await employeeListPage.searchByNameDirect('zzz-nonexistent-xyz-99999');

    await expect(employeeListPage.noRecordsMessage).toBeVisible();
  });
});
