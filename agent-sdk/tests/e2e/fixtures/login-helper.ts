import { Page } from '@playwright/test';

/**
 * Login helper function
 * Uses aria role selectors for reliable login
 */
export async function login(page: Page, email: string = 'test@example.com', password: string = 'testpassword123') {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill login form using role selectors that work with the actual form
  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /password/i }).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Allow state to settle
}

/**
 * Check if user is logged in by checking for logout button
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const logoutButton = page.getByRole('button', { name: /logout/i });
  const isVisible = await logoutButton.isVisible().catch(() => false);
  return isVisible;
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  const logoutButton = page.getByRole('button', { name: /logout/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForLoadState('networkidle');
  }
}
