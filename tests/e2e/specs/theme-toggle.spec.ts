import { test, expect } from '../fixtures/base';

test.describe('Theme Toggle — Dark/Light Mode', () => {
  test.describe.configure({ timeout: 60_000 });

  test('theme toggle button is present', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    await steps.verifyPresence('Sidebar', 'themeToggle');
  });

  test('clicking theme toggle changes theme', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    const initialText = await steps.getText('Sidebar', 'themeToggle');
    await steps.click('Sidebar', 'themeToggle');
    const newText = await steps.getText('Sidebar', 'themeToggle');
    expect(newText).not.toBe(initialText);
  });

  test('clicking theme toggle twice returns to original', async ({ steps }) => {
    await steps.navigateTo('/');
    await steps.waitForState('HomePage', 'bookGrid');
    const initialText = await steps.getText('Sidebar', 'themeToggle');
    await steps.click('Sidebar', 'themeToggle');
    await steps.click('Sidebar', 'themeToggle');
    const finalText = await steps.getText('Sidebar', 'themeToggle');
    expect(finalText).toBe(initialText);
  });
});
