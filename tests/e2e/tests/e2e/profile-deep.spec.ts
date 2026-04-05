import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Profile — Deep Coverage', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test('profile shows no active listings message for fresh user', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'noListings');
  });

  test('profile balance shows dollar format', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    const balance = await steps.getText('ProfilePage', 'balance');
    expect(balance).toContain('$');
  });

  test('profile for different users shows different data', async ({ steps }) => {
    // Login as user1
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/profile');
    const user1Name = await steps.getText('ProfilePage', 'username');

    // Logout and login as user2
    await steps.click('Navigation', 'logoutButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/profile');
    const user2Name = await steps.getText('ProfilePage', 'username');

    expect(user1Name).not.toEqual(user2Name);
  });

  test('profile shows listing after creating one', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a listing
    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 6 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Verify profile no longer shows "no active listings"
    await steps.navigateTo('/profile');
    await steps.verifyCount('ProfilePage', 'myListing', { greaterThan: 0 });
  });

  test('profile page shows all sections', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyPresence('ProfilePage', 'profilePage');
    await steps.verifyPresence('ProfilePage', 'username');
    await steps.verifyPresence('ProfilePage', 'email');
    await steps.verifyPresence('ProfilePage', 'balance');
    await steps.verifyPresence('ProfilePage', 'myListingsHeading');
  });

  test('user2 profile shows correct data', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser2@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.verifyText('ProfilePage', 'username', 'testuser2');
    await steps.verifyText('ProfilePage', 'email', 'testuser2@bookhive.test');
  });
});
