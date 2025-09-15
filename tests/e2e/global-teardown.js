// Global teardown for Playwright tests
export default async function globalTeardown() {
  console.log('Starting global teardown for motorcycle maintenance tracker tests...');

  // Any global cleanup tasks can go here
  // For example: stopping test database, cleaning up test files, etc.

  console.log('Global teardown completed.');
}