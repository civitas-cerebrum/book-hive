import { test, expect } from './fixtures/base';

test.describe('ProfilePage', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps, request }) => {
    await request.post('http://localhost:8080/api/reset');
    await steps.navigateTo('/login');
    await steps.waitForState('LoginPage', 'container');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForState('HomePage', 'bookGrid');
  });

  test('displays user profile information', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyText('ProfilePage', 'username', 'testuser1');
    await steps.verifyText('ProfilePage', 'email', 'testuser1@bookhive.test');
    await steps.verifyTextContains('ProfilePage', 'balance', '$100.00');
  });

  test('shows no active listings message', async ({ steps }) => {
    await steps.navigateTo('/profile');
    await steps.waitForState('ProfilePage', 'container');
    await steps.verifyPresence('ProfilePage', 'noListingsMessage');
  });

  test('sidebar profile link navigates to profile', async ({ steps }) => {
    await steps.click('Sidebar', 'profileLink');
    await steps.verifyUrlContains('/profile');
    await steps.waitForState('ProfilePage', 'container');
  });
});
