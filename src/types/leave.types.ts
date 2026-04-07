export type LeaveRequestStatus =
  | 'PENDING APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'TAKEN';

export interface LeaveType {
  id: number;
  name: string;
  situational: boolean;
  allowedLeavePeriods: unknown[];
}

export interface LeaveRequest {
  id: number;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  appliedDays: number;
  status: {
    id: number;
    type: LeaveRequestStatus;
  };
  comments: unknown[];
  employee: {
    empNumber: number;
    employeeId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    terminationId: number | null;
  };
}

export interface LeaveEntitlement {
  id: number;
  leaveType: LeaveType;
  employee: {
    empNumber: number;
    firstName: string;
    lastName: string;
  };
  entitlementType: {
    id: number;
    name: string;
  };
  fromDate: string;
  toDate: string;
  creditedDate: string;
  noOfDays: number;
  daysUsed: number;
}

export interface CreateLeaveRequestPayload {
  // empNumber is NOT accepted — POST /leave/leave-requests creates a request
  // for the currently authenticated user only.
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  comment?: string;
  duration?: {
    type: 'full_day' | 'half_day_morning' | 'half_day_afternoon';
  };
}

export interface OrangeHrmListResponse<T> {
  data: T[];
  meta: {
    total: number;
  };
  rels: unknown[];
}
