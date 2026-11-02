import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const users: Array<{ username: string; password: string }> = JSON.parse(
  readFileSync(new URL('../users.json', import.meta.url), 'utf8'),
);
const user = users[0];

test('user can log in and create a bug', async ({ page }) => {
  const bugTitle = `Playwright-created bug ${Date.now()}`;
  const bugDescription = 'Created through the BuggyBoard user interface.';

  await page.goto('/login');
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/board$/);
  await page.getByRole('button', { name: 'New Bug' }).click();

  const dialog = page.getByRole('dialog', { name: 'Create bug' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Title').fill(bugTitle);
  await dialog.getByLabel('Severity').selectOption('high');
  await expect(dialog.getByLabel('Owner')).toHaveValue(user.username);
  await dialog.getByLabel('Description').fill(bugDescription);

  const createBugResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/bugs') &&
      response.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Save' }).click();

  const response = await createBugResponse;
  expect(response.status()).toBe(201);
  await expect(dialog).toBeHidden();

  const createdBug = await response.json();
  expect(createdBug).toMatchObject({
    title: bugTitle,
    severity: 'HIGH',
    owner: user.username,
    description: bugDescription,
  });
});