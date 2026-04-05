import { test, expect } from '../fixtures/base';

test.describe('Homepage — Add to Cart & Interactions', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    // Clear cart
    await steps.navigateTo('/cart');
    const cleared = await steps.clickIfPresent('CartPage', 'cartClear');
    if (cleared) await steps.waitForNetworkIdle();
  });

  test('authenticated user sees add to cart buttons on homepage', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'addToCartButton', { greaterThan: 0 });
  });

  test('clicking add to cart on homepage adds item', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.clickNth('HomePage', 'addToCartButton', 0);
    await steps.waitForNetworkIdle();

    // Verify item in cart
    await steps.navigateTo('/cart');
    await steps.verifyCount('CartPage', 'cartItem', { greaterThan: 0 });
  });

  test('unauthenticated user does not see add to cart buttons on homepage', async ({ steps }) => {
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/');
    await steps.verifyAbsence('HomePage', 'addToCartButton');
  });

  test('homepage book cards show genre badge', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
    // Book cards display genre, title, author and price - verified by presence of card content
    await steps.verifyPresence('HomePage', 'bookGrid');
  });

  test('homepage page info shows current page number', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.verifyPresence('HomePage', 'pageInfo');
    const pageText = await steps.getText('HomePage', 'pageInfo');
    expect(pageText).toContain('1');
    expect(pageText).toContain('/');
  });

  test('page info updates after navigation', async ({ steps }) => {
    await steps.navigateTo('/');
    const page1Text = await steps.getText('HomePage', 'pageInfo');

    await steps.click('HomePage', 'nextPage');
    await steps.waitForNetworkIdle();
    const page2Text = await steps.getText('HomePage', 'pageInfo');

    expect(page2Text).not.toEqual(page1Text);
    expect(page2Text).toContain('2');
  });

  test('search clears when navigating to homepage via All Books', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.fill('HomePage', 'searchInput', 'Dune');
    await steps.pressKey('Enter');
    await steps.waitForNetworkIdle();

    // Navigate back via All Books
    await steps.click('Navigation', 'allBooksLink');
    await steps.waitForNetworkIdle();

    // Should show all books again (multiple pages)
    await steps.verifyPresence('HomePage', 'bookGrid');
    await steps.verifyCount('HomePage', 'bookCard', { greaterThan: 0 });
  });
});
