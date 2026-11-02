import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const users: Array<{ username: string; password: string }> = JSON.parse(
  readFileSync(new URL('../users.json', import.meta.url), 'utf8'),
);
const user = users[0];

test('user can edit bug 1 fields', async ({ page }) => {
  const runId = Date.now();
  const edits = [
    { label: 'Title', field: 'title', value: `Edited bug title ${runId}` },
    { label: 'Severity', field: 'severity' },
    { label: 'Description', field: 'description', value: `Edited description ${runId}` },
    { label: 'Owner', field: 'owner', value: `playwright-${runId}` },
  ] as const;

  await page.goto('/login');
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/board$/);

  const bugRow = page
    .locator('table[aria-label="Bugs"] tbody tr')
    .filter({ has: page.getByRole('cell', { name: '1', exact: true }) });
  await expect(bugRow).toHaveCount(1);

  for (const edit of edits) {
    await bugRow.click();

    const dialog = page.getByRole('dialog', { name: 'Edit bug #1' });
    await expect(dialog).toBeVisible();

    const field = dialog.getByLabel(edit.label);
    let updatedValue: string;
    if (edit.field === 'severity') {
      const currentSeverity = await field.inputValue();
      updatedValue = currentSeverity === 'high' ? 'low' : 'high';
      await field.selectOption(updatedValue);
    } else {
      updatedValue = edit.value;
      await field.fill(updatedValue);
    }

    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/bugs/1') &&
        response.request().method() === 'PUT',
    );
    await dialog.getByRole('button', { name: 'Save' }).click();

    const response = await updateResponse;
    expect(response.status()).toBe(200);
    const updatedBug = await response.json();
    expect(updatedBug[edit.field]).toBe(
      edit.field === 'severity' ? updatedValue.toUpperCase() : updatedValue,
    );
    await expect(dialog).toBeHidden();
  }
});