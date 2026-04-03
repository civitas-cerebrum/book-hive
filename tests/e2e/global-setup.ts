import { request } from '@playwright/test';

const API_BASE = 'http://localhost:8080';

async function globalSetup() {
  const context = await request.newContext();

  // Reset and seed the database once before all tests
  console.log('Resetting and seeding the database...');
  const response = await context.post(`${API_BASE}/api/reset`);
  if (!response.ok()) {
    throw new Error(`Failed to reset database: ${response.status()}`);
  }
  console.log('Database reset complete');

  await context.dispose();
}

export default globalSetup;
