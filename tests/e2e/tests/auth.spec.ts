import { test, expect } from '@playwright/test';
import { getSelector, generateTestUser, signupUserViaUI } from '../fixtures/base';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login page with all elements', async ({ page }) => {
      await test.step('Given I am on the login page', async () => {
        await page.goto('/login');
      });

      await test.step('Then I should see the login form', async () => {
        await expect(page.locator(getSelector('LoginPage', 'pageContainer'))).toBeVisible();
        await expect(page.locator(getSelector('LoginPage', 'form'))).toBeVisible();
      });

      await test.step('And I should see email input', async () => {
        await expect(page.locator(getSelector('LoginPage', 'emailInput'))).toBeVisible();
      });

      await test.step('And I should see password input', async () => {
        await expect(page.locator(getSelector('LoginPage', 'passwordInput'))).toBeVisible();
      });

      await test.step('And I should see submit button', async () => {
        await expect(page.locator(getSelector('LoginPage', 'submitButton'))).toBeVisible();
        await expect(page.locator(getSelector('LoginPage', 'submitButton'))).toContainText('Sign In');
      });

      await test.step('And I should see link to signup page', async () => {
        await expect(page.locator(getSelector('LoginPage', 'signupLink'))).toBeVisible();
      });
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      // Create a test user first via UI signup
      const user = generateTestUser();
      await signupUserViaUI(page, user.username, user.email, user.password);

      // Logout to test login flow
      await page.click(getSelector('Common', 'logoutBtn'));
      await page.waitForTimeout(500);

      await test.step('Given I am on the login page', async () => {
        await page.goto('/login');
      });

      await test.step('When I enter valid credentials', async () => {
        await page.fill(getSelector('LoginPage', 'emailInput'), user.email);
        await page.fill(getSelector('LoginPage', 'passwordInput'), user.password);
      });

      await test.step('And I click the login button', async () => {
        await page.click(getSelector('LoginPage', 'submitButton'));
      });

      await test.step('Then I should be redirected to the homepage', async () => {
        await expect(page).toHaveURL('/', { timeout: 10000 });
      });

      await test.step('And I should see authenticated user elements', async () => {
        await expect(page.locator(getSelector('Common', 'navCart'))).toBeVisible();
        await expect(page.locator(getSelector('Common', 'navOrders'))).toBeVisible();
        await expect(page.locator(getSelector('Common', 'logoutBtn'))).toBeVisible();
      });
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await test.step('Given I am on the login page', async () => {
        await page.goto('/login');
      });

      await test.step('When I enter invalid credentials', async () => {
        await page.fill(getSelector('LoginPage', 'emailInput'), 'invalid@email.com');
        await page.fill(getSelector('LoginPage', 'passwordInput'), 'wrongpassword');
      });

      await test.step('And I click the login button', async () => {
        await page.click(getSelector('LoginPage', 'submitButton'));
      });

      await test.step('Then I should see an error message', async () => {
        await expect(page.locator(getSelector('LoginPage', 'error'))).toBeVisible({ timeout: 5000 });
      });

      await test.step('And I should still be on the login page', async () => {
        await expect(page).toHaveURL('/login');
      });
    });

    test('should navigate to signup page from login', async ({ page }) => {
      await test.step('Given I am on the login page', async () => {
        await page.goto('/login');
      });

      await test.step('When I click on the signup link', async () => {
        await page.click(getSelector('LoginPage', 'signupLink'));
      });

      await test.step('Then I should be on the signup page', async () => {
        await expect(page).toHaveURL('/signup');
        await expect(page.locator(getSelector('SignupPage', 'pageContainer'))).toBeVisible();
      });
    });

    test('should require email field', async ({ page }) => {
      await test.step('Given I am on the login page', async () => {
        await page.goto('/login');
      });

      await test.step('When I submit without email', async () => {
        await page.fill(getSelector('LoginPage', 'passwordInput'), 'somepassword');
        await page.click(getSelector('LoginPage', 'submitButton'));
      });

      await test.step('Then the form should not submit (HTML5 validation)', async () => {
        await expect(page).toHaveURL('/login');
      });
    });
  });

  test.describe('Signup', () => {
    test('should display signup page with all elements', async ({ page }) => {
      await test.step('Given I am on the signup page', async () => {
        await page.goto('/signup');
      });

      await test.step('Then I should see the signup form', async () => {
        await expect(page.locator(getSelector('SignupPage', 'pageContainer'))).toBeVisible();
        await expect(page.locator(getSelector('SignupPage', 'form'))).toBeVisible();
      });

      await test.step('And I should see username input', async () => {
        await expect(page.locator(getSelector('SignupPage', 'usernameInput'))).toBeVisible();
      });

      await test.step('And I should see email input', async () => {
        await expect(page.locator(getSelector('SignupPage', 'emailInput'))).toBeVisible();
      });

      await test.step('And I should see password input', async () => {
        await expect(page.locator(getSelector('SignupPage', 'passwordInput'))).toBeVisible();
      });

      await test.step('And I should see submit button', async () => {
        await expect(page.locator(getSelector('SignupPage', 'submitButton'))).toBeVisible();
      });
    });

    test('should signup successfully with valid data', async ({ page }) => {
      const user = generateTestUser();

      await test.step('Given I am on the signup page', async () => {
        await page.goto('/signup');
      });

      await test.step('When I enter valid signup data', async () => {
        await page.fill(getSelector('SignupPage', 'usernameInput'), user.username);
        await page.fill(getSelector('SignupPage', 'emailInput'), user.email);
        await page.fill(getSelector('SignupPage', 'passwordInput'), user.password);
      });

      await test.step('And I click the signup button', async () => {
        await page.click(getSelector('SignupPage', 'submitButton'));
      });

      await test.step('Then I should be redirected to the homepage', async () => {
        await expect(page).toHaveURL('/', { timeout: 15000 });
      });

      await test.step('And I should be logged in', async () => {
        await expect(page.locator(getSelector('Common', 'logoutBtn'))).toBeVisible();
      });
    });

    test('should show error for duplicate email', async ({ page }) => {
      // Create a user first via UI
      const user = generateTestUser();
      await signupUserViaUI(page, user.username, user.email, user.password);

      // Logout
      await page.click(getSelector('Common', 'logoutBtn'));
      await page.waitForTimeout(500);

      await test.step('Given I am on the signup page', async () => {
        await page.goto('/signup');
      });

      await test.step('When I try to signup with an existing email', async () => {
        await page.fill(getSelector('SignupPage', 'usernameInput'), 'newusername');
        await page.fill(getSelector('SignupPage', 'emailInput'), user.email);
        await page.fill(getSelector('SignupPage', 'passwordInput'), user.password);
        await page.click(getSelector('SignupPage', 'submitButton'));
      });

      await test.step('Then I should see an error message', async () => {
        await expect(page.locator(getSelector('SignupPage', 'error'))).toBeVisible({ timeout: 5000 });
      });
    });

    test('should navigate to login page from signup', async ({ page }) => {
      await test.step('Given I am on the signup page', async () => {
        await page.goto('/signup');
      });

      await test.step('When I click on the login link', async () => {
        await page.click(getSelector('SignupPage', 'loginLink'));
      });

      await test.step('Then I should be on the login page', async () => {
        await expect(page).toHaveURL('/login');
        await expect(page.locator(getSelector('LoginPage', 'pageContainer'))).toBeVisible();
      });
    });

    test('should enforce minimum password length', async ({ page }) => {
      await test.step('Given I am on the signup page', async () => {
        await page.goto('/signup');
      });

      await test.step('When I enter a short password', async () => {
        await page.fill(getSelector('SignupPage', 'usernameInput'), 'testuser');
        await page.fill(getSelector('SignupPage', 'emailInput'), 'test@test.com');
        await page.fill(getSelector('SignupPage', 'passwordInput'), 'short');
        await page.click(getSelector('SignupPage', 'submitButton'));
      });

      await test.step('Then the form should show validation or not submit', async () => {
        // Either stay on signup page or show error
        await expect(page).toHaveURL('/signup');
      });
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First signup via UI
      const user = generateTestUser();
      await signupUserViaUI(page, user.username, user.email, user.password);

      await test.step('Given I am logged in', async () => {
        await expect(page.locator(getSelector('Common', 'logoutBtn'))).toBeVisible();
      });

      await test.step('When I click the logout button', async () => {
        await page.click(getSelector('Common', 'logoutBtn'));
      });

      await test.step('Then I should see login and signup links', async () => {
        await expect(page.locator(getSelector('Common', 'navLogin'))).toBeVisible();
        await expect(page.locator(getSelector('Common', 'navSignup'))).toBeVisible();
      });

      await test.step('And I should not see authenticated user elements', async () => {
        await expect(page.locator(getSelector('Common', 'logoutBtn'))).not.toBeVisible();
      });
    });
  });
});
