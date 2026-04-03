import { test, expect, TEST_USERS } from './fixtures/base';

test.describe('Authentication', () => {
  test('should display and use login page', async ({ page, sel }) => {
    await page.goto('/login');
    await expect(page.locator(sel('LoginPage', 'page'))).toBeVisible();
    await expect(page.locator(sel('LoginPage', 'emailInput'))).toBeVisible();
    await expect(page.locator(sel('LoginPage', 'passwordInput'))).toBeVisible();
    await expect(page.locator(sel('LoginPage', 'submitButton'))).toBeVisible();
  });

  test('should login successfully', async ({ page, sel }) => {
    await page.goto('/login');
    await page.locator(sel('LoginPage', 'emailInput')).fill(TEST_USERS.user1.email);
    await page.locator(sel('LoginPage', 'passwordInput')).fill(TEST_USERS.user1.password);
    await page.locator(sel('LoginPage', 'submitButton')).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator(sel('Navigation', 'logoutButton'))).toBeVisible();
  });

  test('should show error for invalid login', async ({ page, sel }) => {
    await page.goto('/login');
    await page.locator(sel('LoginPage', 'emailInput')).fill('invalid@email.com');
    await page.locator(sel('LoginPage', 'passwordInput')).fill('wrongpassword');
    await page.locator(sel('LoginPage', 'submitButton')).click();
    await expect(page.locator(sel('LoginPage', 'errorMessage'))).toBeVisible({ timeout: 10000 });
  });

  test('should display and use signup page', async ({ page, sel }) => {
    await page.goto('/signup');
    await expect(page.locator(sel('SignupPage', 'page'))).toBeVisible();
    await expect(page.locator(sel('SignupPage', 'usernameInput'))).toBeVisible();
    await expect(page.locator(sel('SignupPage', 'emailInput'))).toBeVisible();
    await expect(page.locator(sel('SignupPage', 'passwordInput'))).toBeVisible();
  });

  test('should signup successfully', async ({ page, sel }) => {
    const uniqueEmail = `newuser_${Date.now()}@bookhive.test`;
    await page.goto('/signup');
    await page.locator(sel('SignupPage', 'usernameInput')).fill('newuser');
    await page.locator(sel('SignupPage', 'emailInput')).fill(uniqueEmail);
    await page.locator(sel('SignupPage', 'passwordInput')).fill('NewPassword123');
    await page.locator(sel('SignupPage', 'submitButton')).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator(sel('Navigation', 'logoutButton'))).toBeVisible();
  });

  test('should show error for duplicate email', async ({ page, sel }) => {
    await page.goto('/signup');
    await page.locator(sel('SignupPage', 'usernameInput')).fill('duplicate');
    await page.locator(sel('SignupPage', 'emailInput')).fill(TEST_USERS.user1.email);
    await page.locator(sel('SignupPage', 'passwordInput')).fill('Password123');
    await page.locator(sel('SignupPage', 'submitButton')).click();
    await expect(page.locator(sel('SignupPage', 'errorMessage'))).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page, sel, loginAsUser1 }) => {
    await loginAsUser1();
    await page.locator(sel('Navigation', 'logoutButton')).click();
    await expect(page.locator(sel('Navigation', 'loginLink'))).toBeVisible();
  });

  test('should redirect protected routes to login', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL('/login');
    await page.goto('/orders');
    await expect(page).toHaveURL('/login');
    await page.goto('/profile');
    await expect(page).toHaveURL('/login');
    await page.goto('/marketplace/sell');
    await expect(page).toHaveURL('/login');
  });
});
