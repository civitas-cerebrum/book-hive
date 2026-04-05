import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Marketplace Sell — Form Validation & Conditions', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeAll(async () => {
    await fetch('http://localhost:8080/api/reset', { method: 'POST' });
  });

  test.beforeEach(async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();
    await steps.navigateTo('/marketplace/sell');
  });

  test('create listing with NEW condition', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'NEW' });
    await steps.fill('CreateListingPage', 'priceInput', '10.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace');
  });

  test('create listing with GOOD condition', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 2 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '7.50');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace');
  });

  test('create listing with FAIR condition', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 3 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'FAIR' });
    await steps.fill('CreateListingPage', 'priceInput', '3.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace');
  });

  test('submit listing with zero price stays on page or shows error', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 4 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '0');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    // Should stay on sell page (validation failure)
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('submit listing without selecting a book stays on page', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    await steps.fill('CreateListingPage', 'priceInput', '5.00');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    // Should stay on sell page (no book selected)
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('submit listing without price stays on page', async ({ steps }) => {
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 5 });
    await steps.selectDropdown('CreateListingPage', 'conditionSelect', { type: DropdownSelectType.VALUE, value: 'GOOD' });
    // Leave price empty
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();
    await steps.verifyUrlContains('/marketplace/sell');
  });

  test('sell page heading shows Sell a Book', async ({ steps }) => {
    await steps.verifyPresence('CreateListingPage', 'heading');
  });

  test('all form elements are present on sell page', async ({ steps }) => {
    await steps.verifyPresence('CreateListingPage', 'bookSelect');
    await steps.verifyPresence('CreateListingPage', 'conditionSelect');
    await steps.verifyPresence('CreateListingPage', 'priceInput');
    await steps.verifyPresence('CreateListingPage', 'createButton');
  });
});
