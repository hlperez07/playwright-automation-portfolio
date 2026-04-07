import { test, expect } from '../../src/fixtures/api.fixture';
import { EmployeesApi } from '../../src/api/employees.api';
import { buildEmployee } from '../../src/factories/employee.factory';

test.describe('Employees API', () => {
  test('should return employee list with pagination', async ({ apiClient }) => {
    const employeesApi = new EmployeesApi(apiClient);

    const response = await employeesApi.list({ limit: 10 });

    expect(response.data).toBeInstanceOf(Array);
    expect(response.meta.total).toBeGreaterThan(0);
  });

  test('should create a new employee via POST', async ({ apiClient }, testInfo) => {
    const employeesApi = new EmployeesApi(apiClient);
    const payload = buildEmployee(testInfo.parallelIndex);

    const employee = await employeesApi.create(payload);

    expect(typeof employee.empNumber).toBe('number');
    expect(employee.firstName).toBe(payload.firstName);
  });

  test('should retrieve a specific employee by empNumber', async ({ apiClient }, testInfo) => {
    const employeesApi = new EmployeesApi(apiClient);
    const payload = buildEmployee(testInfo.parallelIndex);
    const created = await employeesApi.create(payload);

    const retrieved = await employeesApi.getByEmpNumber(created.empNumber);

    expect(retrieved.empNumber).toBe(created.empNumber);
    expect(retrieved.firstName).toBe(payload.firstName);
  });

  test('should return 404 for a non-existent employee', async ({ apiClient }) => {
    const employeesApi = new EmployeesApi(apiClient);

    let errorCaught = false;
    try {
      await employeesApi.getByEmpNumber(9999999);
    } catch (error) {
      errorCaught = true;
      // OrangeHRM returns 422 (Invalid Parameter) for non-existent empNumbers
      expect(String(error)).toMatch(/404|422|Not Found|Invalid Parameter/i);
    }

    expect(errorCaught).toBe(true);
  });

  test('should delete an employee via DELETE', async ({ apiClient }, testInfo) => {
    const employeesApi = new EmployeesApi(apiClient);
    const payload = buildEmployee(testInfo.parallelIndex);
    const created = await employeesApi.create(payload);

    await employeesApi.delete([created.empNumber]);

    let errorCaught = false;
    try {
      await employeesApi.getByEmpNumber(created.empNumber);
    } catch (error) {
      errorCaught = true;
      // OrangeHRM returns 422 (Invalid Parameter) for deleted/non-existent empNumbers
      expect(String(error)).toMatch(/404|422|Not Found|Invalid Parameter/i);
    }

    expect(errorCaught).toBe(true);
  });
});
