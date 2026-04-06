import type { CreateVacancyPayload } from '../types/recruitment.types';

export function buildVacancy(
  workerIndex: number,
  overrides?: Partial<CreateVacancyPayload>,
): CreateVacancyPayload {
  const uniqueId = `${workerIndex}-${Date.now()}`;
  return {
    name: `AutoVacancy-${uniqueId}`,
    jobTitleId: 1,    // default first job title in OrangeHRM demo
    employeeId: 7,    // default admin user empNumber in OrangeHRM demo
    status: true,
    isPublished: true,
    numOfPositions: 1,
    ...overrides,
  };
}

export function buildCandidate(
  vacancyId: number,
  workerIndex: number,
): {
  firstName: string;
  lastName: string;
  email: string;
  vacancyId: number;
  consentToKeepData: boolean;
} {
  const uniqueId = `${workerIndex}-${Date.now()}`;
  return {
    firstName: `CandFirst${uniqueId}`,
    lastName: `CandLast${uniqueId}`,
    email: `cand-${uniqueId}@auto.test`,
    vacancyId,
    consentToKeepData: true,
  };
}
