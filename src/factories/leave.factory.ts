import type { CreateLeaveRequestPayload } from '../types/leave.types';

/**
 * Returns future weekday dates for leave requests.
 * Uses workerIndex to offset dates so parallel workers don't collide.
 */
export function buildLeaveRequest(
  leaveTypeId: number,
  workerIndex: number,
  overrides?: Partial<CreateLeaveRequestPayload>,
): CreateLeaveRequestPayload {
  // Generate a future date that is always a weekday (Monday)
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 30 + workerIndex * 7);
  // Move to Monday if not already
  const day = baseDate.getDay();
  if (day === 0) baseDate.setDate(baseDate.getDate() + 1); // Sunday → Monday
  if (day === 6) baseDate.setDate(baseDate.getDate() + 2); // Saturday → Monday
  const dateStr = baseDate.toISOString().split('T')[0];

  return {
    leaveTypeId,
    fromDate: dateStr,
    toDate: dateStr,
    comment: `auto-test-${workerIndex}-${Date.now()}`,
    ...overrides,
  };
}
