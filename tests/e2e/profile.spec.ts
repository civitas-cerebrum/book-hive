import { test, expect, TEST_USER_1, TEST_USER_2, API_BASE_URL } from './fixtures/base';
import pageRepository from './data/page-repository.json';

test.describe('User Profile', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the app to known state before each test
    await request.post(`${API_BASE_URL}/api/reset`);
  });

  test('should display profile page with user information', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user navigates to profile page', async () => {
      await page.locator(pageRepository.Navigation.profileLink).click();
    });

    await test.step('Then the profile page should be displayed', async () => {
      await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
    });

    await test.step('And the username should be displayed', async () => {
      await expect(page.locator(pageRepository.ProfilePage.username)).toBeVisible();
      const username = await page.locator(pageRepository.ProfilePage.username).textContent();
      expect(username).toBe(TEST_USER_1.username);
    });

    await test.step('And the email should be displayed', async () => {
      await expect(page.locator(pageRepository.ProfilePage.email)).toBeVisible();
      const email = await page.locator(pageRepository.ProfilePage.email).textContent();
      expect(email).toBe(TEST_USER_1.email);
    });

    await test.step('And the balance should be displayed', async () => {
      await expect(page.locator(pageRepository.ProfilePage.balance)).toBeVisible();
      const balance = await page.locator(pageRepository.ProfilePage.balance).textContent();
      expect(balance).toMatch(/\$\d+\.\d{2}/);
    });
  });

  test('should display initial balance of $100', async ({ page }) => {
    await test.step('Given the user is logged in with a fresh account', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user views their profile', async () => {
      await page.locator(pageRepository.Navigation.profileLink).click();
      await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
    });

    await test.step('Then the balance should be $100.00', async () => {
      const balance = await page.locator(pageRepository.ProfilePage.balance).textContent();
      expect(balance).toBe('$100.00');
    });
  });

  test('should display no listings message when user has no listings', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('When the user views their profile', async () => {
      await page.locator(pageRepository.Navigation.profileLink).click();
      await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
    });

    await test.step('Then the no listings message should be displayed', async () => {
      await expect(page.locator(pageRepository.ProfilePage.noListings)).toBeVisible();
    });
  });

  test('should display balance in sidebar when logged in', async ({ page }) => {
    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('Then the balance should be visible in the sidebar', async () => {
      await expect(page.locator(pageRepository.Navigation.userBalance)).toBeVisible();
      const balance = await page.locator(pageRepository.Navigation.userBalance).textContent();
      expect(balance).toMatch(/\$\d+\.\d{2}/);
    });
  });

  test('should update balance after purchase', async ({ page }) => {
    let initialBalance: number;

    await test.step('Given the user is logged in', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
    });

    await test.step('And notes their initial balance', async () => {
      await page.locator(pageRepository.Navigation.profileLink).click();
      const balanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      initialBalance = parseFloat(balanceText?.replace('$', '') || '0');
    });

    await test.step('When the user makes a purchase', async () => {
      await page.goto('/');
      await page.locator('[data-testid="add-to-cart-book-001"]').click();
      await page.waitForTimeout(500);
      await page.locator(pageRepository.Navigation.cartLink).click();
      await page.locator(pageRepository.CartPage.checkoutButton).click();
      await page.waitForTimeout(1000);
    });

    await test.step('Then the balance should be reduced', async () => {
      // Navigate to profile page and wait for fresh data
      await page.goto('/profile');
      await expect(page.locator(pageRepository.ProfilePage.container)).toBeVisible();
      const newBalanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      const newBalance = parseFloat(newBalanceText?.replace('$', '') || '0');
      expect(newBalance).toBeLessThan(initialBalance);
    });
  });

  test('should increase balance when selling in marketplace', async ({ page, request }) => {
    let initialBalance: number;

    await test.step('Given user1 has created a listing', async () => {
      const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: { email: TEST_USER_1.email, password: TEST_USER_1.password }
      });
      const { token } = await loginResponse.json();

      await request.post(`${API_BASE_URL}/api/marketplace/listings`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { bookId: 'book-001', condition: 'GOOD', price: 10.00 }
      });

      // Note user1's initial balance
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await page.locator(pageRepository.Navigation.profileLink).click();
      const balanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      initialBalance = parseFloat(balanceText?.replace('$', '') || '0');
      await page.locator(pageRepository.Navigation.logoutButton).click();
    });

    await test.step('And user2 buys the listing', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_2.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_2.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();

      await page.goto('/marketplace');
      const buyButton = page.locator('[data-testid^="listing-buy-"]').first();
      await buyButton.click();
      await page.waitForTimeout(1000);
      await page.locator(pageRepository.Navigation.logoutButton).click();
    });

    await test.step('When user1 checks their balance', async () => {
      await page.goto('/login');
      await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
      await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
      await page.locator(pageRepository.LoginPage.submitButton).click();
      await page.locator(pageRepository.Navigation.profileLink).click();
    });

    await test.step('Then user1 balance should have increased', async () => {
      const newBalanceText = await page.locator(pageRepository.ProfilePage.balance).textContent();
      const newBalance = parseFloat(newBalanceText?.replace('$', '') || '0');
      expect(newBalance).toBeGreaterThan(initialBalance);
    });
  });
});
