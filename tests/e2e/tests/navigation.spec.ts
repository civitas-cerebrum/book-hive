import { test, expect } from './fixtures/base';

test.describe('Navigation & Sidebar', () => {
  test.describe.configure({ timeout: 60_000 });

  test('sidebar displays all genre category links', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyPresence('Sidebar', 'genreFilterFiction');
    await steps.verifyPresence('Sidebar', 'genreFilterSciFi');
    await steps.verifyPresence('Sidebar', 'genreFilterNonFiction');
    await steps.verifyPresence('Sidebar', 'genreFilterBiography');
    await steps.verifyPresence('Sidebar', 'genreFilterFantasy');
    await steps.verifyPresence('Sidebar', 'genreFilterMystery');
  });

  test('sidebar logo is visible', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyPresence('Sidebar', 'logo');
    await steps.verifyTextContains('Sidebar', 'logo', 'BookHive');
  });

  test('marketplace page accessible without auth', async ({ steps }) => {
    await steps.navigateTo('/marketplace');
    await steps.waitForState('MarketplacePage', 'container');
    await steps.verifyUrlContains('/marketplace');
  });

  test('book detail accessible without auth', async ({ steps }) => {
    await steps.navigateTo('/books/book-001');
    await steps.waitForState('BookDetailPage', 'container');
    await steps.verifyPresence('BookDetailPage', 'bookTitle');
  });

  test('browser back button works from book detail to home', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.click('HomePage', 'firstBookCard');
    await steps.verifyUrlContains('/books/book-001');
    await steps.backOrForward('back');
    await steps.verifyUrlContains('/');
  });

  test('search preserves in URL query', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.fill('HomePage', 'searchInput', 'Tolkien');
    await steps.pressKey('Enter');
    await steps.verifyUrlContains('query=Tolkien');
  });
});
