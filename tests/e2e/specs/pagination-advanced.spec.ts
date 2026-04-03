import { test, expect } from '../fixtures/base';

test.describe('Pagination — Advanced', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('last page has Next button disabled', async ({ steps }) => {
    for (let i = 0; i < 4; i++) {
      await steps.click('HomePage', 'nextButton');
      await steps.page.waitForTimeout(500);
      await steps.waitForState('HomePage', 'bookGrid');
    }
    await steps.verifyState('HomePage', 'nextButton', 'disabled');
    await steps.verifyState('HomePage', 'prevButton', 'enabled');
  });

  test('page 2 shows different books than page 1', async ({ steps, page }) => {
    const page1Titles = await steps.getAll('HomePage', 'bookTitle');
    await steps.click('HomePage', 'nextButton');
    // Wait for the book list to change by verifying a page 1 book is no longer first
    await page.waitForFunction(
      (oldTitle) => {
        const firstTitle = document.querySelector("[data-testid^='book-title-']");
        return firstTitle && firstTitle.textContent !== oldTitle;
      },
      page1Titles[0],
      { timeout: 10000 }
    );
    const page2Titles = await steps.getAll('HomePage', 'bookTitle');
    expect(page1Titles[0]).not.toBe(page2Titles[0]);
  });

  test('last page has 2 books', async ({ steps }) => {
    for (let i = 0; i < 4; i++) {
      await steps.click('HomePage', 'nextButton');
      await steps.page.waitForTimeout(500);
      await steps.waitForState('HomePage', 'bookGrid');
    }
    await steps.page.waitForTimeout(500);
    const lastPageCount = await steps.getCount('HomePage', 'bookCards');
    expect(lastPageCount).toBe(2);
  });
});
