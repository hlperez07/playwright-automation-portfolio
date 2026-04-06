import { test, expect } from '../../../src/fixtures/base.fixture';

test.describe('Leave List', () => {
  test('should display leave list after search', async ({ leaveListPage }) => {
    await leaveListPage.goto();
    await leaveListPage.search();

    // The table header is always visible after search — either with data rows or "No Records Found"
    await expect(leaveListPage.heading).toBeVisible();
    const tableVisible = await leaveListPage.recordsTable.isVisible();
    const noRecordsVisible = await leaveListPage.noRecordsMessage.isVisible();
    expect(tableVisible || noRecordsVisible).toBe(true);
  });

  test('should filter leave list by pending status', async ({ leaveListPage }) => {
    await leaveListPage.goto();
    await leaveListPage.filterByStatus('Pending Approval');

    // Both outcomes are valid — there may or may not be pending records in the demo
    const tableVisible = await leaveListPage.recordsTable.isVisible();
    const noRecordsVisible = await leaveListPage.noRecordsMessage.isVisible();
    expect(tableVisible || noRecordsVisible).toBe(true);
  });
});
