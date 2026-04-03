import { test as setup } from '@playwright/test';

setup('reset database', async ({ request }) => {
  const response = await request.post('http://localhost:8080/api/reset');
  if (!response.ok()) {
    throw new Error(`Failed to reset database: ${response.status()}`);
  }
});
