import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const users: Array<{ username: string; password: string }> = JSON.parse(
  readFileSync(new URL('../users.json', import.meta.url), 'utf8'),
);
const firstUser = users[0];

test.describe('BuggyBoard login', () => {
  test('logs in using the first configured user', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill(firstUser.username);
    await page.getByLabel('Password').fill(firstUser.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/board$/);
    await expect(page.getByRole('heading', { name: 'BuggyBoard' })).toBeVisible();
  });
});
