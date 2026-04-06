export interface Employee {
  empNumber: number;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  terminationId: number | null;
}

export interface CreateEmployeePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId?: string;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
  };
  rels: unknown[];
}

export interface OrangeHrmResponse<T> {
  data: T;
  meta: {
    total: number;
  };
  rels: unknown[];
}
