import { test, expect } from '@playwright/test';

test.describe('IQ English - User Management Module E2E Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

  test('E2E-UM-01: Admin Logs in and Views User Directory', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder*="usuario"]', 'admin.alberto');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await page.goto(`${BASE_URL}/users`);
    await expect(page.locator('text=Gestion de Usuarios')).toBeVisible();
    await expect(page.locator('text=admin.alberto')).toBeVisible();
  });

  test('E2E-UM-02: User Search and Role Filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder*="usuario"]', 'admin.alberto');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/users`);
    await page.fill('input[placeholder*="Buscar"]', 'carlos');
    await page.click('button:has-text("Filtrar")');
    await expect(page.locator('text=student.carlos')).toBeVisible();
  });

  test('E2E-UM-03: Create New User Modal Display', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder*="usuario"]', 'admin.alberto');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/users`);
    await page.click('button:has-text("Nuevo Usuario")');
    await expect(page.locator('text=Registrar Nuevo Usuario')).toBeVisible();
  });

  test('E2E-UM-04: Non-Admin User Access Forbidden to /users', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder*="usuario"]', 'student.carlos');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.goto(`${BASE_URL}/users`);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('E2E-UM-05: Change Own Password Modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[placeholder*="usuario"]', 'student.carlos');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Contrasena")');
    await expect(page.locator('text=Cambiar Mi Contrasena')).toBeVisible();
  });
});
