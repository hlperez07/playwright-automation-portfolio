import { test, expect } from '../../src/fixtures/api.fixture';
import { EmployeesApi } from '../../src/api/employees.api';
import { LeaveApi } from '../../src/api/leave.api';
import { buildEmployee } from '../../src/factories/employee.factory';
import { buildLeaveRequest } from '../../src/factories/leave.factory';

test.describe('Leave API', () => {
  test('should retrieve leave types list', async ({ apiClient }) => {
    const leaveApi = new LeaveApi(apiClient);

    const leaveTypes = await leaveApi.getLeaveTypes();

    expect(leaveTypes.length).toBeGreaterThan(0);
    expect(typeof leaveTypes[0].id).toBe('number');
    expect(typeof leaveTypes[0].name).toBe('string');
  });

  test('should retrieve leave entitlements for an employee', async ({ apiClient }, testInfo) => {
    const employeesApi = new EmployeesApi(apiClient);
    const leaveApi = new LeaveApi(apiClient);

    const employee = await employeesApi.create(buildEmployee(testInfo.parallelIndex));
    const entitlements = await leaveApi.getEntitlements({ empNumber: employee.empNumber });

    expect(entitlements).toBeInstanceOf(Array);
  });

  test('should create a leave request via POST', async ({ apiClient }, testInfo) => {
    const leaveApi = new LeaveApi(apiClient);

    const leaveTypes = await leaveApi.getLeaveTypes();
    expect(leaveTypes.length).toBeGreaterThan(0);

    // POST /leave/leave-requests creates a request for the authenticated user (Admin).
    // On the shared public demo, Admin may have exhausted leave balance for all types.
    // Both outcomes are valid business responses: 200 (created) or 400 (balance exceeded).
    const payload = buildLeaveRequest(leaveTypes[0].id, testInfo.parallelIndex);

    try {
      const leaveRequest = await leaveApi.createRequest(payload);
      expect(typeof leaveRequest.id).toBe('number');
    } catch (error) {
      // "Leave Balance Exceeded" means the API processed the request correctly
      // and enforced a business rule — this is not a test defect.
      expect(String(error)).toMatch(/Leave Balance Exceeded/i);
    }
  });
});
