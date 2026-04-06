import type { ApiClient } from './api-client';
import type {
  Employee,
  CreateEmployeePayload,
  EmployeeListResponse,
  OrangeHrmResponse,
} from '../types/employee.types';

export class EmployeesApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * Lists employees with optional filtering and pagination.
   * GET /web/index.php/api/v2/pim/employees
   */
  async list(params?: {
    limit?: number;
    offset?: number;
    nameOrId?: string;
  }): Promise<EmployeeListResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    if (params?.offset !== undefined) queryParams['offset'] = params.offset;
    if (params?.nameOrId !== undefined) queryParams['nameOrId'] = params.nameOrId;

    return this.client.get<EmployeeListResponse>('pim/employees', queryParams);
  }

  /**
   * Creates a new employee.
   * POST /web/index.php/api/v2/pim/employees
   * Unwraps the `data` field from the OrangeHRM envelope.
   */
  async create(payload: CreateEmployeePayload): Promise<Employee> {
    const response = await this.client.post<OrangeHrmResponse<Employee>>(
      'pim/employees',
      payload,
    );
    return response.data;
  }

  /**
   * Retrieves a single employee by their empNumber.
   * GET /web/index.php/api/v2/pim/employees/{empNumber}
   * Unwraps the `data` field from the OrangeHRM envelope.
   */
  async getByEmpNumber(empNumber: number): Promise<Employee> {
    const response = await this.client.get<OrangeHrmResponse<Employee>>(
      `pim/employees/${empNumber}`,
    );
    return response.data;
  }

  /**
   * Deletes one or more employees by their empNumbers.
   * DELETE /web/index.php/api/v2/pim/employees
   * OrangeHRM uses a `{ ids: [...] }` body for bulk delete.
   */
  async delete(empNumbers: number[]): Promise<void> {
    await this.client.delete<void>('pim/employees', { ids: empNumbers });
  }
}
