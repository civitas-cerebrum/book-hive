# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> Login >> should show error with invalid credentials
- Location: auth.spec.ts:34:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid=\'login-error\']')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('[data-testid=\'login-error\']')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]: BookHive
    - generic [ref=e6]: Browse
    - link "All Books" [ref=e7] [cursor=pointer]:
      - /url: /
    - link "Marketplace" [ref=e8] [cursor=pointer]:
      - /url: /marketplace
    - generic [ref=e9]: Categories
    - link "Fiction" [ref=e10] [cursor=pointer]:
      - /url: /?genre=Fiction
    - link "Sci-Fi" [ref=e11] [cursor=pointer]:
      - /url: /?genre=Sci-Fi
    - link "Non-Fiction" [ref=e12] [cursor=pointer]:
      - /url: /?genre=Non-Fiction
    - link "Biography" [ref=e13] [cursor=pointer]:
      - /url: /?genre=Biography
    - link "Fantasy" [ref=e14] [cursor=pointer]:
      - /url: /?genre=Fantasy
    - link "Mystery" [ref=e15] [cursor=pointer]:
      - /url: /?genre=Mystery
    - generic [ref=e16]: Account
    - link "Login" [ref=e17] [cursor=pointer]:
      - /url: /login
    - link "Sign Up" [ref=e18] [cursor=pointer]:
      - /url: /signup
    - button "☀️" [ref=e20] [cursor=pointer]
  - main [ref=e21]:
    - generic [ref=e22]:
      - heading "Welcome back" [level=1] [ref=e23]
      - paragraph [ref=e24]: Sign in to your BookHive account
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: Email
          - textbox "Email" [ref=e28]
        - generic [ref=e29]:
          - generic [ref=e30]: Password
          - textbox "Password" [ref=e31]
        - button "Sign In" [ref=e32] [cursor=pointer]
      - paragraph [ref=e33]:
        - text: Don't have an account?
        - link "Sign up" [ref=e34] [cursor=pointer]:
          - /url: /signup
```

# Test source

```ts
  1   | import { test, expect, TEST_USER_1, TEST_USER_2, API_BASE_URL } from './fixtures/base';
  2   | import pageRepository from './data/page-repository.json';
  3   | 
  4   | test.describe('Authentication', () => {
  5   |   test.beforeEach(async ({ request }) => {
  6   |     // Reset the app to known state before each test
  7   |     await request.post(`${API_BASE_URL}/api/reset`);
  8   |   });
  9   | 
  10  |   test.describe('Login', () => {
  11  |     test('should login with valid credentials', async ({ page }) => {
  12  |       await test.step('Given the user is on the login page', async () => {
  13  |         await page.goto('/login');
  14  |         await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
  15  |       });
  16  | 
  17  |       await test.step('When the user enters valid credentials', async () => {
  18  |         await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
  19  |         await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
  20  |       });
  21  | 
  22  |       await test.step('And clicks the login button', async () => {
  23  |         await page.locator(pageRepository.LoginPage.submitButton).click();
  24  |       });
  25  | 
  26  |       await test.step('Then the user should be logged in and redirected', async () => {
  27  |         await expect(page).not.toHaveURL(/\/login/);
  28  |         // User should see authenticated navigation options
  29  |         await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
  30  |         await expect(page.locator(pageRepository.Navigation.profileLink)).toBeVisible();
  31  |       });
  32  |     });
  33  | 
  34  |     test('should show error with invalid credentials', async ({ page }) => {
  35  |       await test.step('Given the user is on the login page', async () => {
  36  |         await page.goto('/login');
  37  |         await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
  38  |       });
  39  | 
  40  |       await test.step('When the user enters invalid credentials', async () => {
  41  |         await page.locator(pageRepository.LoginPage.emailInput).fill('invalid@test.com');
  42  |         await page.locator(pageRepository.LoginPage.passwordInput).fill('wrongpassword');
  43  |       });
  44  | 
  45  |       await test.step('And clicks the login button', async () => {
  46  |         await page.locator(pageRepository.LoginPage.submitButton).click();
  47  |       });
  48  | 
  49  |       await test.step('Then an error message should be displayed', async () => {
  50  |         // Wait for the login attempt to complete and error to appear
> 51  |         await expect(page.locator(pageRepository.LoginPage.errorMessage)).toBeVisible({ timeout: 15000 });
      |                                                                           ^ Error: expect(locator).toBeVisible() failed
  52  |       });
  53  | 
  54  |       await test.step('And the user should remain on the login page', async () => {
  55  |         await expect(page).toHaveURL(/\/login/);
  56  |       });
  57  |     });
  58  | 
  59  |     test('should navigate to signup page from login', async ({ page }) => {
  60  |       await test.step('Given the user is on the login page', async () => {
  61  |         await page.goto('/login');
  62  |         await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
  63  |       });
  64  | 
  65  |       await test.step('When the user clicks on signup link', async () => {
  66  |         await page.locator(pageRepository.LoginPage.signupLink).click();
  67  |       });
  68  | 
  69  |       await test.step('Then the user should be on the signup page', async () => {
  70  |         await expect(page).toHaveURL(/\/signup/);
  71  |         await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
  72  |       });
  73  |     });
  74  |   });
  75  | 
  76  |   test.describe('Signup', () => {
  77  |     test('should register a new user', async ({ page }) => {
  78  |       const uniqueEmail = `newuser_${Date.now()}@test.com`;
  79  |       const uniqueUsername = `newuser_${Date.now()}`;
  80  | 
  81  |       await test.step('Given the user is on the signup page', async () => {
  82  |         await page.goto('/signup');
  83  |         await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
  84  |       });
  85  | 
  86  |       await test.step('When the user enters registration details', async () => {
  87  |         await page.locator(pageRepository.SignupPage.usernameInput).fill(uniqueUsername);
  88  |         await page.locator(pageRepository.SignupPage.emailInput).fill(uniqueEmail);
  89  |         await page.locator(pageRepository.SignupPage.passwordInput).fill('NewUser123!');
  90  |       });
  91  | 
  92  |       await test.step('And clicks the signup button', async () => {
  93  |         await page.locator(pageRepository.SignupPage.submitButton).click();
  94  |       });
  95  | 
  96  |       await test.step('Then the user should be registered and logged in', async () => {
  97  |         await expect(page).not.toHaveURL(/\/signup/);
  98  |         // User should see authenticated navigation options
  99  |         await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
  100 |       });
  101 |     });
  102 | 
  103 |     test('should show error when registering with existing email', async ({ page }) => {
  104 |       await test.step('Given the user is on the signup page', async () => {
  105 |         await page.goto('/signup');
  106 |         await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
  107 |       });
  108 | 
  109 |       await test.step('When the user tries to register with an existing email', async () => {
  110 |         await page.locator(pageRepository.SignupPage.usernameInput).fill('duplicateuser');
  111 |         await page.locator(pageRepository.SignupPage.emailInput).fill(TEST_USER_1.email);
  112 |         await page.locator(pageRepository.SignupPage.passwordInput).fill('Test1234!');
  113 |       });
  114 | 
  115 |       await test.step('And clicks the signup button', async () => {
  116 |         await page.locator(pageRepository.SignupPage.submitButton).click();
  117 |       });
  118 | 
  119 |       await test.step('Then an error message should be displayed', async () => {
  120 |         await expect(page.locator(pageRepository.SignupPage.errorMessage)).toBeVisible();
  121 |       });
  122 |     });
  123 | 
  124 |     test('should navigate to login page from signup', async ({ page }) => {
  125 |       await test.step('Given the user is on the signup page', async () => {
  126 |         await page.goto('/signup');
  127 |         await expect(page.locator(pageRepository.SignupPage.container)).toBeVisible();
  128 |       });
  129 | 
  130 |       await test.step('When the user clicks on login link', async () => {
  131 |         await page.locator(pageRepository.SignupPage.loginLink).click();
  132 |       });
  133 | 
  134 |       await test.step('Then the user should be on the login page', async () => {
  135 |         await expect(page).toHaveURL(/\/login/);
  136 |         await expect(page.locator(pageRepository.LoginPage.container)).toBeVisible();
  137 |       });
  138 |     });
  139 |   });
  140 | 
  141 |   test.describe('Logout', () => {
  142 |     test('should logout successfully', async ({ page }) => {
  143 |       await test.step('Given the user is logged in', async () => {
  144 |         await page.goto('/login');
  145 |         await page.locator(pageRepository.LoginPage.emailInput).fill(TEST_USER_1.email);
  146 |         await page.locator(pageRepository.LoginPage.passwordInput).fill(TEST_USER_1.password);
  147 |         await page.locator(pageRepository.LoginPage.submitButton).click();
  148 |         await expect(page.locator(pageRepository.Navigation.logoutButton)).toBeVisible();
  149 |       });
  150 | 
  151 |       await test.step('When the user clicks logout', async () => {
```