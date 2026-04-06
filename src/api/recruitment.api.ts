import type { ApiClient } from './api-client';
import type {
  Vacancy,
  Candidate,
  CreateVacancyPayload,
  CreateCandidatePayload,
} from '../types/recruitment.types';
import type { OrangeHrmListResponse } from '../types/leave.types';
import type { OrangeHrmResponse } from '../types/employee.types';

export class RecruitmentApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * Lists all vacancies with optional pagination.
   * GET /web/index.php/api/v2/recruitment/vacancies
   * Unwraps the `data` array from the OrangeHRM envelope.
   */
  async listVacancies(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Vacancy[]> {
    const queryParams: Record<string, string | number> = {};
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    if (params?.offset !== undefined) queryParams['offset'] = params.offset;

    const response = await this.client.get<OrangeHrmListResponse<Vacancy>>(
      'recruitment/vacancies',
      queryParams,
    );
    return response.data;
  }

  /**
   * Creates a new vacancy.
   * POST /web/index.php/api/v2/recruitment/vacancies
   * Unwraps the `data` field from the OrangeHRM envelope.
   */
  async createVacancy(payload: CreateVacancyPayload): Promise<Vacancy> {
    const response = await this.client.post<OrangeHrmResponse<Vacancy>>(
      'recruitment/vacancies',
      payload,
    );
    return response.data;
  }

  /**
   * Lists candidates with optional vacancy filter and pagination.
   * GET /web/index.php/api/v2/recruitment/candidates
   * Unwraps the `data` array from the OrangeHRM envelope.
   */
  async listCandidates(params?: {
    vacancyId?: number;
    limit?: number;
  }): Promise<Candidate[]> {
    const queryParams: Record<string, string | number> = {};
    if (params?.vacancyId !== undefined) queryParams['vacancyId'] = params.vacancyId;
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;

    const response = await this.client.get<OrangeHrmListResponse<Candidate>>(
      'recruitment/candidates',
      queryParams,
    );
    return response.data;
  }

  /**
   * Creates a new candidate application.
   * POST /web/index.php/api/v2/recruitment/candidates
   * Unwraps the `data` field from the OrangeHRM envelope.
   */
  async createCandidate(payload: CreateCandidatePayload): Promise<Candidate> {
    const response = await this.client.post<OrangeHrmResponse<Candidate>>(
      'recruitment/candidates',
      payload,
    );
    return response.data;
  }

  /**
   * Deletes one or more candidates by their IDs.
   * DELETE /web/index.php/api/v2/recruitment/candidates
   * OrangeHRM uses a `{ ids: [...] }` body for bulk delete.
   */
  async deleteCandidate(ids: number[]): Promise<void> {
    await this.client.delete<void>('recruitment/candidates', { ids });
  }
}
