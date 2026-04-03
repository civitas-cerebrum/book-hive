const API_BASE_URL = 'http://localhost:8080';

async function globalSetup() {
  console.log('Global setup: Resetting database...');
  const response = await fetch(`${API_BASE_URL}/api/reset`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to reset database in global setup');
  }
  console.log('Database reset successfully');
}

export default globalSetup;
