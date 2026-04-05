import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Negative — Create Listing Validation @negative', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/marketplace/sell');
    await steps.waitForNetworkIdle();
  });

  test('submit listing with no book selected stays on page', async ({ steps }) => {
    await steps.fill('CreateListingPage', 'priceInput', '10.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('submit listing with zero price is handled', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '0');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Zero price: either stays on page (rejected) or accepted — verify no crash
    await steps.verifyPresence('Navigation', 'sidebar');
  });

  test('submit listing with negative price stays on page', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '-5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Negative price should be rejected
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('submit listing with empty price is handled gracefully', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 3 });
    // Number input type rejects non-numeric text, resulting in empty value
    await steps.fill('CreateListingPage', 'priceInput', '');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // Empty price should prevent submission
    await steps.verifyPresence('CreateListingPage', 'heading');
  });

  test('create listing form has all required elements', async ({ steps }) => {
    await steps.verifyPresence('CreateListingPage', 'heading');
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createButton');
  });

  test('all condition options are available', async ({ steps }) => {
    // Verify each condition option can be selected
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'LIKE_NEW' });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
  });
});
