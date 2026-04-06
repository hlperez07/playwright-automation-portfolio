import type { ApiClient } from './api-client';
import type {
  LeaveType,
  LeaveRequest,
  LeaveEntitlement,
  CreateLeaveRequestPayload,
  OrangeHrmListResponse,
} from '../types/leave.types';
import type { OrangeHrmResponse } from '../types/employee.types';

export class LeaveApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * Retrieves all available leave types.
   * GET /web/index.php/api/v2/leave/leave-types
   * Unwraps the `data` array from the OrangeHRM envelope.
   */
  async getLeaveTypes(): Promise<LeaveType[]> {
    const response = await this.client.get<OrangeHrmListResponse<LeaveType>>(
      'leave/leave-types',
    );
    return response.data;
  }

  /**
   * Retrieves leave entitlements for a given employee, optionally filtered by leave type.
   * GET /web/index.php/api/v2/leave/leave-entitlements
   * Unwraps the `data` array from the OrangeHRM envelope.
   */
  async getEntitlements(params: {
    empNumber: number;
    leaveTypeId?: number;
  }): Promise<LeaveEntitlement[]> {
    const queryParams: Record<string, string | number> = {
      empNumber: params.empNumber,
    };
    if (params.leaveTypeId !== undefined) {
      queryParams['leaveTypeId'] = params.leaveTypeId;
    }

    const response = await this.client.get<OrangeHrmListResponse<LeaveEntitlement>>(
      'leave/leave-entitlements',
      queryParams,
    );
    return response.data;
  }

  /**
   * Creates a new leave request.
   * POST /web/index.php/api/v2/leave/leave-requests
   * Unwraps the `data` field from the OrangeHRM envelope.
   */
  async createRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    const response = await this.client.post<OrangeHrmResponse<LeaveRequest>>(
      'leave/leave-requests',
      payload,
    );
    return response.data;
  }
}
