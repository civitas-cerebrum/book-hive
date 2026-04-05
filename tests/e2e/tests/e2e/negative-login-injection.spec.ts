import { test, expect } from '../fixtures/base';

test.describe('Negative — Login Injection & Boundary @negative', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
  });

  test('login with XSS payload in email field shows error', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', '<script>alert("xss")</script>');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('login with SQL injection in email field shows error', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', "' OR 1=1 --");
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('login with HTML injection in password field stays on login', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', '<img src=x onerror=alert(1)>');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('login with extremely long email shows error', async ({ steps }) => {
    const longEmail = 'a'.repeat(500) + '@test.com';
    await steps.fill('LoginPage', 'emailInput', longEmail);
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('login with extremely long password shows error', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'P'.repeat(1000));
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });

  test('login with special characters in email shows error', async ({ steps }) => {
    await steps.fill('LoginPage', 'emailInput', '!@#$%^&*()');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/login');
  });
});
