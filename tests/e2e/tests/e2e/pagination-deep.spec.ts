import { test, expect } from '../fixtures/base';

test.describe('Pagination — Deep Navigation', () => {
  test.describe.configure({ timeout: 60_000 });

  test('first page has Previous button disabled', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'prevPage');
    await steps.verifyState('HomePage', 'prevPage', 'disabled');
  });

  test('navigating to page 2 enables Previous button', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.click('HomePage', 'nextPage');
    await steps.verifyState('HomePage', 'prevPage', 'enabled');
  });

  test('can navigate through multiple pages', async ({ steps }) => {
    await steps.navigateTo('/');
    // Go to page 2
    await steps.click('HomePage', 'nextPage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    // Go to page 3
    await steps.click('HomePage', 'nextPage');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });

  test('navigating to last page disables Next button', async ({ steps }) => {
    await steps.navigateTo('/');
    // Navigate forward until Next is disabled
    await steps.click('HomePage', 'nextPage');
    await steps.click('HomePage', 'nextPage');
    await steps.click('HomePage', 'nextPage');
    await steps.click('HomePage', 'nextPage');
    // Page 5 is last (5 pages total)
    await steps.verifyState('HomePage', 'nextPage', 'disabled');
  });
});
