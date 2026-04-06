import type { CreateEmployeePayload } from '../types/employee.types';

export function buildEmployee(
  workerIndex: number,
  overrides?: Partial<CreateEmployeePayload>,
): CreateEmployeePayload {
  const uniqueId = `${workerIndex}-${Date.now()}`;
  return {
    firstName: `AutoFirst${uniqueId}`,
    lastName: `AutoLast${uniqueId}`,
    employeeId: '',
    ...overrides,
  };
}
