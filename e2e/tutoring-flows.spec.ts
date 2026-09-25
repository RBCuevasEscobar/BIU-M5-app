import { test, expect { from '@playwright/test';

test.describe('IQ English Tutoring Platform - End-to-End Flows', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

  test('E2E-01: Student Login and Navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'carlos.estudiante@iqenglish.mx');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Carlos Mendoza')).toBeVisible();
  });

  test('E2E-02: Teacher Login and Attendance View', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'laura.teacher@iqenglish.mx');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Laura Mar��nez')).toBeVisible();
  });

  test('E2E-03: TalkIO Oral Practice Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'carlos.estudiante@iqenglish.mx');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.goto(`${BASE_URL}/talkio`);
    await expect(page.locator('text=Pr�ctica Oral TalkIO')).toBeVisible();
  });

  test('E2E-04: Admin Access to Audit Logs', await page.goto async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@iqenglish.mx');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.goto(`${BASE_URL}/audit-logs`);
    await expect(page.locator('text=Logs de Auditor�a')).toBeVisible();
  });
});
