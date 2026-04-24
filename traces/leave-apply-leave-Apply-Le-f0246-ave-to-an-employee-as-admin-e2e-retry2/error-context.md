# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/leave/apply-leave.spec.ts >> Apply Leave >> should assign leave to an employee as admin
- Location: tests/e2e/leave/apply-leave.spec.ts:76:7

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for getByPlaceholder('yyyy-dd-mm').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic:
    - complementary [ref=e4]:
      - navigation "Sidepanel" [ref=e5]:
        - generic [ref=e6]:
          - link "client brand banner" [ref=e7] [cursor=pointer]:
            - /url: https://www.orangehrm.com/
            - img "client brand banner" [ref=e9]
          - text: 
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - textbox "Search" [ref=e15]
              - button "" [ref=e16] [cursor=pointer]:
                - generic [ref=e17]: 
            - separator [ref=e18]
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "Admin" [ref=e21] [cursor=pointer]:
                - /url: /web/index.php/admin/viewAdminModule
                - generic [ref=e24]: Admin
            - listitem [ref=e25]:
              - link "PIM" [ref=e26] [cursor=pointer]:
                - /url: /web/index.php/pim/viewPimModule
                - generic [ref=e40]: PIM
            - listitem [ref=e41]:
              - link "Leave" [ref=e42] [cursor=pointer]:
                - /url: /web/index.php/leave/viewLeaveModule
                - generic [ref=e45]: Leave
            - listitem [ref=e46]:
              - link "Time" [ref=e47] [cursor=pointer]:
                - /url: /web/index.php/time/viewTimeModule
                - generic [ref=e53]: Time
            - listitem [ref=e54]:
              - link "Recruitment" [ref=e55] [cursor=pointer]:
                - /url: /web/index.php/recruitment/viewRecruitmentModule
                - generic [ref=e61]: Recruitment
            - listitem [ref=e62]:
              - link "My Info" [ref=e63] [cursor=pointer]:
                - /url: /web/index.php/pim/viewMyDetails
                - generic [ref=e69]: My Info
            - listitem [ref=e70]:
              - link "Performance" [ref=e71] [cursor=pointer]:
                - /url: /web/index.php/performance/viewPerformanceModule
                - generic [ref=e79]: Performance
            - listitem [ref=e80]:
              - link "Dashboard" [ref=e81] [cursor=pointer]:
                - /url: /web/index.php/dashboard/index
                - generic [ref=e84]: Dashboard
            - listitem [ref=e85]:
              - link "Directory" [ref=e86] [cursor=pointer]:
                - /url: /web/index.php/directory/viewDirectory
                - generic [ref=e89]: Directory
            - listitem [ref=e90]:
              - link "Maintenance" [ref=e91] [cursor=pointer]:
                - /url: /web/index.php/maintenance/viewMaintenanceModule
                - generic [ref=e95]: Maintenance
            - listitem [ref=e96]:
              - link "Claim" [ref=e97] [cursor=pointer]:
                - /url: /web/index.php/claim/viewClaimModule
                - img [ref=e100]
                - generic [ref=e104]: Claim
            - listitem [ref=e105]:
              - link "Buzz" [ref=e106] [cursor=pointer]:
                - /url: /web/index.php/buzz/viewBuzz
                - generic [ref=e109]: Buzz
    - banner [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - text: 
          - heading "Leave" [level=6] [ref=e114]
        - link "Upgrade" [ref=e116]:
          - /url: https://orangehrm.com/open-source/upgrade-to-advanced
          - button "Upgrade" [ref=e117] [cursor=pointer]: Upgrade
        - list [ref=e123]:
          - listitem [ref=e124]:
            - generic [ref=e125] [cursor=pointer]:
              - img "profile picture" [ref=e126]
              - paragraph [ref=e127]: manda user
              - generic [ref=e128]: 
      - navigation "Topbar Menu" [ref=e130]:
        - list [ref=e131]:
          - listitem [ref=e132] [cursor=pointer]:
            - link "Apply" [ref=e133]:
              - /url: "#"
          - listitem [ref=e134] [cursor=pointer]:
            - link "My Leave" [ref=e135]:
              - /url: "#"
          - listitem [ref=e136] [cursor=pointer]:
            - generic [ref=e137]:
              - text: Entitlements
              - generic [ref=e138]: 
          - listitem [ref=e139] [cursor=pointer]:
            - generic [ref=e140]:
              - text: Reports
              - generic [ref=e141]: 
          - listitem [ref=e142] [cursor=pointer]:
            - generic [ref=e143]:
              - text: Configure
              - generic [ref=e144]: 
          - listitem [ref=e145] [cursor=pointer]:
            - link "Leave List" [ref=e146]:
              - /url: "#"
          - listitem [ref=e147] [cursor=pointer]:
            - link "Assign Leave" [ref=e148]:
              - /url: "#"
          - button "" [ref=e150] [cursor=pointer]:
            - generic [ref=e151]: 
  - generic [ref=e152]:
    - generic [ref=e155]:
      - heading "Assign Leave" [level=6] [ref=e156]
      - separator [ref=e157]
      - generic [ref=e158]:
        - generic [ref=e162]:
          - generic [ref=e164]: Employee Name*
          - textbox "Type for hints..." [ref=e168]: AutoFirst1-1777006825084 AutoLast1-1777006825084
        - generic [ref=e170]:
          - generic [ref=e172]:
            - generic [ref=e174]: Leave Type*
            - generic [ref=e177] [cursor=pointer]:
              - generic [ref=e178]: CAN - Bereavement
              - generic [ref=e180]: 
          - generic [ref=e182]:
            - generic [ref=e183]:
              - generic [ref=e184]: Leave Balance
              - generic [ref=e185] [cursor=pointer]: 
            - paragraph [ref=e187]: 0.00 Day(s)
        - generic [ref=e189]:
          - generic [ref=e191]:
            - generic [ref=e193]: From Date*
            - generic [ref=e196]:
              - textbox "dd-mm-yyyy" [ref=e197]
              - generic [ref=e198] [cursor=pointer]: 
          - generic [ref=e200]:
            - generic [ref=e202]: To Date*
            - generic [ref=e205]:
              - textbox "dd-mm-yyyy" [ref=e206]
              - generic [ref=e207] [cursor=pointer]: 
        - generic [ref=e211]:
          - generic [ref=e213]: Comments
          - textbox [ref=e215]
        - separator [ref=e216]
        - generic [ref=e217]:
          - paragraph [ref=e218]: "* Required"
          - button "Assign" [ref=e219] [cursor=pointer]
    - generic [ref=e220]:
      - paragraph [ref=e221]: OrangeHRM OS 5.8
      - paragraph [ref=e222]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e223] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
  1  | import { type Page, type Locator } from '@playwright/test';
  2  | import { OxdLocators, OrangeHrmCommon } from '../../locators/orangehrm.locators';
  3  | import { AssignLeaveLocators } from '../../locators/assign-leave.locators';
  4  | 
  5  | export class AssignLeavePage {
  6  |   readonly heading: Locator;
  7  |   readonly employeeNameInput: Locator;
  8  |   readonly leaveTypeDropdown: Locator;
  9  |   readonly fromDateInput: Locator;
  10 |   readonly toDateInput: Locator;
  11 |   readonly assignButton: Locator;
  12 |   readonly successToast: Locator;
  13 | 
  14 |   constructor(readonly page: Page) {
  15 |     this.heading = page.getByRole('heading', { name: AssignLeaveLocators.headingName });
  16 |     // OrangeHRM employee name field uses a typeahead with placeholder text
  17 |     this.employeeNameInput = page.getByPlaceholder(OrangeHrmCommon.typeaheadPlaceholder);
  18 |     // Leave type uses OrangeHRM's custom oxd-select component
  19 |     this.leaveTypeDropdown = page
  20 |       .locator(OxdLocators.formRow)
  21 |       .filter({ hasText: AssignLeaveLocators.leaveTypeRowText })
  22 |       .locator(OxdLocators.selectText);
  23 |     // Assign Leave date inputs use mm-dd-yyyy placeholder (different from Apply Leave's yyyy-dd-mm).
  24 |     this.fromDateInput = page.getByPlaceholder(AssignLeaveLocators.datePlaceholder).first();
  25 |     this.toDateInput = page.getByPlaceholder(AssignLeaveLocators.datePlaceholder).last();
  26 |     this.assignButton = page.getByRole('button', { name: AssignLeaveLocators.assignButton });
  27 |     this.successToast = page.getByText(OrangeHrmCommon.successToastText);
  28 |   }
  29 | 
  30 |   async goto(): Promise<void> {
  31 |     await this.page.goto('/web/index.php/leave/assignLeave');
  32 |   }
  33 | 
  34 |   /** Waits for the form's async data loader to clear before interactions begin. */
  35 |   async waitForReady(): Promise<void> {
  36 |     await this.page.locator(OxdLocators.formLoader).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  37 |   }
  38 | 
  39 |   async assignLeave(
  40 |     employeeName: string,
  41 |     leaveType: string,
  42 |     fromDate: string,
  43 |     toDate: string,
  44 |   ): Promise<void> {
  45 |     await this.employeeNameInput.fill(employeeName);
  46 |     await this.page.getByRole('option', { name: employeeName }).first().click();
  47 |     await this.leaveTypeDropdown.click();
  48 |     // OrangeHRM's custom select has no role="listbox". Scope to the dropdown CSS class.
  49 |     await this.page.locator(OxdLocators.selectDropdown).getByRole('option', { name: leaveType }).first().click();
  50 |     // OrangeHRM re-fetches duration/balance after leave type selection — wait for the
  51 |     // loader to clear before trying to fill the date inputs.
  52 |     await this.page.locator(OxdLocators.formLoader).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
> 53 |     await this.fromDateInput.fill(fromDate);
     |                              ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
  54 |     await this.fromDateInput.press('Tab');
  55 |     await this.toDateInput.fill(toDate);
  56 |     await this.toDateInput.press('Tab');
  57 |   }
  58 | 
  59 |   async submit(): Promise<void> {
  60 |     await this.assignButton.click();
  61 |   }
  62 | }
  63 | 
```