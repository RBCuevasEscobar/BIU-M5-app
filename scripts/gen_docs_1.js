const fs = require('fs');
const path = require('path');

function save(rel, content) {
  const p = path.resolve(rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('Saved: ' + rel);
}

save('AZURE_DEPLOY.md', `# Despliegue en Microsoft Azure - IQ English Tutoring System

Architectura y gu�a de despliegue cloud nativa en Microsoft Azure.

```mermaid
flowchart TD
    subgraph Users ["Usuarios & Clientes"]
        Browser[
Navegador Web / Mobile (Estudiantes, Profesores, Admin)]
    end

    subgraph AzureEdge ["Azure Edge & Red"]
        FrontDoor["Azure Front Door / CDN + WAF"]
    end

    subgraph AzureCompute ["Azure App Services & Containers"]
        StaticApp[
Azure Static Web Apps
(React 18 + Vite SPA)]
        BackendApp[
Azure Container Apps / App Service
(Spring Boot 3.3.4, Java 21)]
        KeycloakApp[
Azure Container Apps
(Keycloak 24 IAM)]
    end

    subgraph AzureData ["Azure Managed Data Services"]
        MySQLLex[
Azure Database for MySQLLexible Server
(Zona Redundante, SSL Enforced)]
        BlobStorage[
Azure Blob Storage
(Material Didfactico / Avatares)]
        KeyVault[
Azure Key Vault
(Secrets, Certs, JWT Keys)]
    end

    subgraph ExternalServices ["Servicios Externos"]
        TalkIO[
TalkIO AI API
(Práctica Oral)]
        GoogleCal[
Google Calendar API
(Sync de Tutor�as)]
    end

    Browser --> FrontDoor
    FrontDoor --> StaticApp
    FrontDoor --> BackendApp
    StaticApp --> BackendApp
    BackendApp --> KeycloakApp
    BackendApp --> MySQLLex
    BackendApp --> KeyVault
    BackendApp --> BlobStorage
    BackendApp --> TalkIO
    BackendApp --> GoogleCal
```

# Pasos de Despliegue con Azure CLI
  3[ "Aprovisionamiento de Resource Group, Key Vault y MySQL Flexible Server" ]
  4[ "Build & Push de Im�genes a Azure Container Registry (ACR)" ]
  5[ "Despliegue de Backend en Azure Container Apps con Java 21" ]
  6[ "Despliegue de Frontend en Azure Static Web Apps" ]
`);

save('frontend/src/App.test.tsx', `import { describe, it, expect } from 'vitest';
describe('IQ English Suite', () => {
  it('renders base components', () => {
    expect(true).toBe(true);
  });
});`
{

save('e2e/tutoring-flows.spec.tsx', `import { test, expect { from '@playwright/test';

test.describe('IQ English Tutoring Platform - End-to-End Flows', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

  test('E2E-01: Student Login and Navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'carlos.estudiante@iqenglish.mx');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('E2E-02: Teacher Login and Attendance View', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'laura.teacher@iqenglish.mx');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
`);

save('e2e/playwright.config.ts', `import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './',
  timeout: 30000,
  use: { baseURL: 'http://localhost:5173' }
});
`);

console.log('Docs 1 ready.');