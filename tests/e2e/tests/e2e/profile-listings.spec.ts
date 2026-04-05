import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Profile -- Listings Management', () => {
  test.describe.configure({ timeout: 60_000 });

  test('creating a listing shows it on profile page', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 6 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '12.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('ProfilePage', 'myListingsHeading');
    await steps.verifyCount('ProfilePage', 'cancelListingButton', { greaterThan: 0 });
  });

  test('cancel listing removes it from profile', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    // Create a listing first
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 7 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.waitForNetworkIdle();
    const countBefore = await steps.getCount('ProfilePage', 'cancelListingButton');
    expect(countBefore).toBeGreaterThan(0);

    await steps.clickNth('ProfilePage', 'cancelListingButton', 0);
    await steps.waitForNetworkIdle();

    // Wait for the listing to be removed from DOM
    await steps.retryUntil(
      async () => {},
      async () => {
        const countAfter = await steps.getCount('ProfilePage', 'cancelListingButton');
        expect(countAfter).toBeLessThan(countBefore);
      },
      5, 500
    );
  });

  test('profile shows balance with dollar sign', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/profile');
    await steps.waitForNetworkIdle();
    await steps.verifyPresence('ProfilePage', 'balance');
    const balanceText = await steps.getText('ProfilePage', 'balance');
    expect(balanceText).toContain('$');
  });
});
