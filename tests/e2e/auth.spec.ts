import { test, expect, TEST_USER_1, TEST_USER_2, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('Authentication', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await test.step('Given the user is on the login page', async () => {
        await page.goto('/login');
        await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
      });

      await test.step('When the user enters valid credentials', async () => {
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      });

      await test.step('And clicks the login button', async () => {
        await page.locator(pageRepository.LoginPage.submitButton).click();
      });

      await test.step('Then the user should be logged in and redirected', async () => {
        await expect(page).not.toHaveURL(/\/login/);
        // User should see authenticated navigation options
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
        await expect(page.locator(pageRepository.Navigation.profileLink)).toBeVisible();
      });
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await test.step('Given the user is on the login page', async () => {
        await page.goto('/login');
        await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
      });

      await test.step('When the user enters invalid credentials', async () => {
        await page.locator(pageRepository.LoginPage.emailInput).fill('invalid@test.com');
        await page.locator(pageRepository.LoginPage.passwordInput).fill('wrongpassword');
      });

      await test.step('And clicks the login button', async () => {
        await page.locator(pageRepository.LoginPage.submitButton).click();
      });

      await test.step('Then an error message should be displayed', async () => {
        // Wait for the login attempt to complete and error to appear
        await expect(page.locator(pageRepository.LoginPage.errorMessage)).toBeVisible({ timeout: 15000 });
      });

      await test.step('And the user should remain on the login page', async () => {
        await expect(page).toHaveURL(/\/login/);
      });
    });

    test('should navigate to signup page from login', async ({ page }) => {
      await test.step('Given the user is on the login page', async () => {
        await page.goto('/login');
        await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
      });

      await test.step('When the user clicks on signup link', async () => {
        await page.locator(pageRepository.LoginPage.signupLink).click();
      });

      await test.step('Then the user should be on the signup page', async () => {
        await expect(page).toHaveURL(/\/signup/);
        await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
      });
    });
  });

  test.describe('Signup', () => {
    test('should register a new user', async ({ page }) => {
      const uniqueEmail = `newuser_${Date.now()}@test.com`;
      const uniqueUsername = `newuser_${Date.now()}`;

      await test.step('Given the user is on the signup page', async () => {
        await page.goto('/signup');
        await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
      });

      await test.step('When the user enters registration details', async () => {
        await page.locator(pageRepository.SignupPage.usernameInput).fill(uniqueUsername);
        await page.locator(pageRepository.SignupPage.emailInput).fill(uniqueEmail);
        await page.locator(pageRepository.SignupPage.passwordInput).fill('NewUser123!');
      });

      await test.step('And clicks the signup button', async () => {
        await page.locator(pageRepository.SignupPage.submitButton).click();
      });

      await test.step('Then the user should be registered and logged in', async () => {
        await expect(page).not.toHaveURL(/\/signup/);
        // User should see authenticated navigation options
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });
    });

    test('should show error when registering with existing email', async ({ page }) => {
      await test.step('Given the user is on the signup page', async () => {
        await page.goto('/signup');
        await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
      });

      await test.step('When the user tries to register with an existing email', async () => {
        await page.locator(pageRepository.SignupPage.usernameInput).fill('duplicateuser');
        await page.locator(pageRepository.SignupPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.SignupPage.passwordInput).fill('Test1234!');
      });

      await test.step('And clicks the signup button', async () => {
        await page.locator(pageRepository.SignupPage.submitButton).click();
      });

      await test.step('Then an error message should be displayed', async () => {
        await expect(page.locator(pageRepository.SignupPage.errorMessage)).toBeVisible();
      });
    });

    test('should navigate to login page from signup', async ({ page }) => {
      await test.step('Given the user is on the signup page', async () => {
        await page.goto('/signup');
        await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
      });

      await test.step('When the user clicks on login link', async () => {
        await page.locator(pageRepository.SignupPage.loginLink).click();
      });

      await test.step('Then the user should be on the login page', async () => {
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
      });
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      await test.step('Given the user is logged in', async () => {
        await page.goto('/login');
        await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
        await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
        await page.locator(pageRepository.LoginPage.submitButton).click();
        await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
      });

      await test.step('When the user clicks logout', async () => {
        await page.locator(pageRepository.Navigation.logoutButton).click();
      });

      await test.step('Then the user should be logged out', async () => {
        // User should see login/signup options again
        await expect(page.locator(pageRepository.Navigation.loginLink)).toBeVisible();
        await expect(page.locator(pageRepository.Navigation.signupLink)).toBeVisible();
      });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing cart without authentication', async ({ page }) => {
      await test.step('Given the user is not logged in', async () => {
        await page.goto('/');
      });

      await test.step('When the user tries to access the cart page', async () => {
        await page.goto('/cart');
      });

      await test.step('Then the user should be redirected to login', async () => {
        await expect(page).toHaveURL(/\/login/);
      });
    });

    test('should redirect to login when accessing orders without authentication', async ({ page }) => {
      await test.step('Given the user is not logged in', async () => {
        await page.goto('/');
      });

      await test.step('When the user tries to access the orders page', async () => {
        await page.goto('/orders');
      });

      await test.step('Then the user should be redirected to login', async () => {
        await expect(page).toHaveURL(/\/login/);
      });
    });

    test('should redirect to login when accessing profile without authentication', async ({ page }) => {
      await test.step('Given the user is not logged in', async () => {
        await page.goto('/');
      });

      await test.step('When the user tries to access the profile page', async () => {
        await page.goto('/profile');
      });

      await test.step('Then the user should be redirected to login', async () => {
        await expect(page).toHaveURL(/\/login/);
      });
    });
  });
});
