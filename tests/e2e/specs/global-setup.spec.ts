import { test } from '../fixtures/base';

test.describe('Global Setup', () => {
  test.describe.configure({ timeout: 30_000 });

  test('reset database to clean state', async ({ steps }) => {
    const response = await steps.page.request.post('http://localhost:8080/api/reset');
    const body = await response.json();
    test.expect(body.status).toBe('reset');
  });
});
