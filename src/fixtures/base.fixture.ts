import { test as apiTest, expect } from './api.fixture';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { EmployeeListPage } from '../pages/pim/employee-list.page';
import { AddEmployeePage } from '../pages/pim/add-employee.page';
import { LeaveListPage } from '../pages/leave/leave-list.page';
import { AssignLeavePage } from '../pages/leave/assign-leave.page';
import { CandidatesPage } from '../pages/recruitment/candidates.page';
import { AddCandidatePage } from '../pages/recruitment/add-candidate.page';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeeListPage: EmployeeListPage;
  addEmployeePage: AddEmployeePage;
  leaveListPage: LeaveListPage;
  assignLeavePage: AssignLeavePage;
  candidatesPage: CandidatesPage;
  addCandidatePage: AddCandidatePage;
};

export const test = apiTest.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  employeeListPage: async ({ page }, use) => {
    await use(new EmployeeListPage(page));
  },
  addEmployeePage: async ({ page }, use) => {
    await use(new AddEmployeePage(page));
  },
  leaveListPage: async ({ page }, use) => {
    await use(new LeaveListPage(page));
  },
  assignLeavePage: async ({ page }, use) => {
    await use(new AssignLeavePage(page));
  },
  candidatesPage: async ({ page }, use) => {
    await use(new CandidatesPage(page));
  },
  addCandidatePage: async ({ page }, use) => {
    await use(new AddCandidatePage(page));
  },
});

export { expect };
