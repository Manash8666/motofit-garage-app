import { test, expect } from '@playwright/test';

test('test warranty dropdown visibility', async ({ page }) => {
    // 1. Navigate to Repair Ops
    await page.goto('/');
    await page.getByText('Repair Ops').click();

    // 2. Open New Mission Modal
    await page.getByRole('button', { name: 'New Mission' }).click();

    // 3. Enter non-engine service - verify dropdown NOT visible
    await page.getByPlaceholder('e.g. Engine Diagnostic, Oil Change').fill('Oil Change');
    await expect(page.getByText('Warranty Coverage')).not.toBeVisible();

    // 4. Enter Engine Repair - verify dropdown visible
    await page.getByPlaceholder('e.g. Engine Diagnostic, Oil Change').fill('Engine Repair');
    await expect(page.getByText('Warranty Coverage')).toBeVisible();

    // 5. Select Warranty Yes
    await page.getByRole('combobox').nth(2).selectOption('yes'); // Assuming it's the 3rd select

    // 6. Submit
    const vehicleId = `TEST-${Date.now()}`;
    await page.getByPlaceholder('e.g. GJ-01-AB-1234').fill(vehicleId);
    await page.getByRole('button', { name: 'Deploy Mission' }).click();

    // 7. Verify mission created
    await expect(page.getByText(vehicleId)).toBeVisible();
});
