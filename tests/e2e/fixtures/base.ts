import { test as base, expect } from '@playwright/test';
import { baseFixture } from '@civitas-cerebrum/element-interactions';
import * as path from 'path';

// Test user credentials
export const TEST_USERS = {
  user1: { email: 'testuser1@bookhive.test', password: 'Test1234!', username: 'testuser1' },
  user2: { email: 'testuser2@bookhive.test', password: 'Test1234!', username: 'testuser2' },
};

export const API_BASE_URL = 'http://localhost:8080';

// API helper functions for test setup/teardown
export async function resetDatabase(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/reset`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to reset database');
  }
}

export async function loginViaAPI(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Failed to login via API');
  const data = await response.json();
  return data.token;
}

export async function clearCartViaAPI(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

// Create base test with Steps API from element-interactions
const pageRepoPath = path.join(__dirname, '../data/page-repository.json');
const baseTest = baseFixture(base, pageRepoPath);

// Extend with custom fixtures for login helpers - all using Steps API
export const test = baseTest.extend<{
  loginAsUser1: () => Promise<void>;
  loginAsUser2: () => Promise<void>;
  apiLogin: (email: string, password: string) => Promise<string>;
  clearCart: (token: string) => Promise<void>;
  resetDB: () => Promise<void>;
}>({
  loginAsUser1: async ({ steps }, use) => {
    await use(async () => {
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'emailInput', TEST_USERS.user1.email);
      await steps.fill('LoginPage', 'passwordInput', TEST_USERS.user1.password);
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('Navigation', 'logoutButton', 'visible');
    });
  },
  loginAsUser2: async ({ steps }, use) => {
    await use(async () => {
      await steps.navigateTo('/login');
      await steps.fill('LoginPage', 'emailInput', TEST_USERS.user2.email);
      await steps.fill('LoginPage', 'passwordInput', TEST_USERS.user2.password);
      await steps.click('LoginPage', 'submitButton');
      await steps.waitForState('Navigation', 'logoutButton', 'visible');
    });
  },
  apiLogin: async ({}, use) => {
    await use(async (email: string, password: string) => {
      return loginViaAPI(email, password);
    });
  },
  clearCart: async ({}, use) => {
    await use(async (token: string) => {
      await clearCartViaAPI(token);
    });
  },
  resetDB: async ({}, use) => {
    await use(async () => {
      await resetDatabase();
    });
  },
});

export { expect };
