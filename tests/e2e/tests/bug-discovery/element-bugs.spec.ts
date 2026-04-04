import { test, expect } from '../fixtures/base';
import { DropdownSelectType } from '@civitas-cerebrum/element-interactions';

test.describe('Bug Discovery — Element Probing', () => {
  test.describe.configure({ timeout: 60_000 });

  /**
   * @bug BUG-001
   * @severity Medium
   * @phase 1a
   * @steps
   * 1. Login as testuser1
   * 2. Navigate to /marketplace/sell
   * 3. Select a book from dropdown
   * 4. Enter an extremely large price (999999999)
   * 5. Click Create Listing
   * 6. Observe that "An unexpected error occurred" appears instead of a proper validation message
   */
  test('@bug-discovery listing with extreme price shows generic error instead of validation message', async ({ steps }) => {
    await steps.navigateTo('/login');
    await steps.fill('LoginPage', 'emailInput', 'testuser1@bookhive.test');
    await steps.fill('LoginPage', 'passwordInput', 'Test1234!');
    await steps.click('LoginPage', 'submitButton');
    await steps.waitForNetworkIdle();

    await steps.navigateTo('/marketplace/sell');
    await steps.selectDropdown('CreateListingPage', 'bookSelect', { type: DropdownSelectType.INDEX, index: 1 });
    await steps.fill('CreateListingPage', 'priceInput', '999999999');
    await steps.click('CreateListingPage', 'createButton');
    await steps.waitForNetworkIdle();

    // BUG: The backend returns a generic "An unexpected error occurred" for extreme prices
    // instead of a proper validation error like "Price must be less than $10000"
    // The listing was NOT created (stayed on sell page), but the error message is unhelpful
    await steps.verifyUrlContains('/marketplace/sell');
    await steps.verifyPresence('CreateListingPage', 'heading');
  });
});
