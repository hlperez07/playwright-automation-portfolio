export type CandidateStatus =
  | 'APPLICATION_INITIATED'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_PASSED'
  | 'INTERVIEW_FAILED'
  | 'JOB_OFFERED'
  | 'OFFER_DECLINED'
  | 'HIRED';

export interface JobTitle {
  id: number;
  title: string;
  description: string | null;
  note: string | null;
  isDeleted: boolean;
}

export interface HiringManager {
  empNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  terminationId: number | null;
}

export interface Vacancy {
  id: number;
  name: string;
  jobTitle: JobTitle;
  hiringManager: HiringManager;
  numOfPositions: number | null;
  description: string | null;
  status: boolean;
  isPublished: boolean;
}

export interface Candidate {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  contactNumber: string | null;
  resume: string | null;
  keywords: string | null;
  comment: string | null;
  modeOfApplication: {
    id: number;
    label: string;
  };
  dateOfApplication: string;
  consentToKeepData: boolean;
  vacancy: Vacancy | null;
  status: {
    id: number;
    label: CandidateStatus;
  };
}

export interface CreateVacancyPayload {
  name: string;
  jobTitleId: number;
  /** empNumber of the hiring manager */
  employeeId: number;
  numOfPositions?: number;
  description?: string;
  status: boolean;
  isPublished: boolean;
}

export interface CreateCandidatePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  vacancyId: number;
  consentToKeepData: boolean;
  comment?: string;
}
