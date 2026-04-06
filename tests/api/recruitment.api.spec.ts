import { test, expect } from '../../src/fixtures/api.fixture';
import { RecruitmentApi } from '../../src/api/recruitment.api';
import { buildVacancy, buildCandidate } from '../../src/factories/vacancy.factory';

test.describe('Recruitment API', () => {
  test('should retrieve vacancies list', async ({ apiClient }) => {
    const recruitmentApi = new RecruitmentApi(apiClient);

    const vacancies = await recruitmentApi.listVacancies();

    expect(vacancies).toBeInstanceOf(Array);
  });

  test('should create a vacancy via POST', async ({ apiClient }, testInfo) => {
    const recruitmentApi = new RecruitmentApi(apiClient);
    const payload = buildVacancy(testInfo.parallelIndex);

    const vacancy = await recruitmentApi.createVacancy(payload);

    expect(typeof vacancy.id).toBe('number');
    expect(vacancy.name).toBe(payload.name);
  });

  test('should add a candidate via POST', async ({ apiClient }, testInfo) => {
    const recruitmentApi = new RecruitmentApi(apiClient);

    const vacancyPayload = buildVacancy(testInfo.parallelIndex);
    const vacancy = await recruitmentApi.createVacancy(vacancyPayload);

    const candidatePayload = buildCandidate(vacancy.id, testInfo.parallelIndex);
    const candidate = await recruitmentApi.createCandidate(candidatePayload);

    expect(typeof candidate.id).toBe('number');
    expect(candidate.firstName).toBe(candidatePayload.firstName);
  });

  test('should delete a candidate via DELETE', async ({ apiClient }, testInfo) => {
    const recruitmentApi = new RecruitmentApi(apiClient);

    const vacancy = await recruitmentApi.createVacancy(buildVacancy(testInfo.parallelIndex));
    const candidatePayload = buildCandidate(vacancy.id, testInfo.parallelIndex);
    const candidate = await recruitmentApi.createCandidate(candidatePayload);

    await recruitmentApi.deleteCandidate([candidate.id]);

    const candidates = await recruitmentApi.listCandidates({ vacancyId: vacancy.id });
    const stillExists = candidates.some((c) => c.id === candidate.id);

    expect(stillExists).toBe(false);
  });
});
