import { test, expect } from '../fixtures/base';

test.describe('Signup Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('http://localhost:8080/api/reset');
  });

  test('@functional signup-happy creates account and redirects to home', async ({ steps }) => {
    const uniqueEmail = `newuser_${Date.now()}@bookhive.test`;

    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupForm');

    const uniqueUser = `User_${Date.now()}`;
    await steps.fill('SignupPage', 'signupUsername', uniqueUser);
    await steps.fill('SignupPage', 'signupEmail', uniqueEmail);
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');

    // Verify redirect to home page after successful signup
    await steps.verifyPresence('HomePage', 'homePage');

    // Verify user is authenticated
    await steps.verifyPresence('Navigation', 'logoutBtn');
    await steps.verifyPresence('Navigation', 'userBalance');
  });

  test('@functional signup-happy new user has starting balance', async ({ steps }) => {
    const uniqueEmail = `newuser2_${Date.now()}@bookhive.test`;

    await steps.navigateTo('/signup');
    const uniqueUser = `User2_${Date.now()}`;
    await steps.fill('SignupPage', 'signupUsername', uniqueUser);
    await steps.fill('SignupPage', 'signupEmail', uniqueEmail);
    await steps.fill('SignupPage', 'signupPassword', 'Test1234!');
    await steps.click('SignupPage', 'signupSubmit');

    await steps.verifyPresence('HomePage', 'homePage');
    // New users should have a balance displayed
    await steps.verifyText('Navigation', 'userBalance', undefined, { notEmpty: true });
  });

  test('@functional signup-happy signup form has link to login', async ({ steps }) => {
    await steps.navigateTo('/signup');
    await steps.verifyPresence('SignupPage', 'signupForm');
    await steps.verifyPresence('SignupPage', 'loginLink');

    await steps.click('SignupPage', 'loginLink');
    await steps.verifyUrlContains('/login');
    await steps.verifyPresence('LoginPage', 'loginForm');
  });
});
