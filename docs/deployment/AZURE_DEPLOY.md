# Gu�a de Despliegue en Microsoft Azure - IQ ENGLISH 
---

Este documento detalla el modelo de despliegue cloud-nativo en **Microsoft Azure** para el **Sistema de Gesti�n de Tutor�as IQ English**, garantizando resiliencia global, soporte de trafico escalable, y cumplimiento de seguridad.

## 1. Diagrama de Arquitectura en Azure

<!-- DIAGRAM 9: AZURE CLOUD DEPLOYMENT ======================================== -->

```mermaid
flowchart TD
    subgraph Clients ["Usuarios y Clientes"]
        Browser["Navegadores Web & M�viles (Estudiantes, Docentes, Supervisores, Admins)"]
    end

    subgraph AzureEdge ["Azure Edge & Application Gateway"]
        FdWaf ["Azure Front Door / Application Gateway + WAF (OWASP Top 10)"]
    end

    subgraph AzureCompute ["Azure Compute & Containers"]
        StaticApp ["Azure Static Web Apps\n(React 18 + Vite SPA)"]
        BackendApp ["Azure Container Apps \n (Spring Boot 3.3.4, Java 21 JVM) (Autoscale 1-10)"]
        KeycloakApp ["Azure Container Apps \n (Keycloak 24 OAuth2/OIDC) (optional)"]
    end

    subgraph AzureData ["Azure Managed Data & Security"]
        MySQLLex ["Azure Database for MySQLLexible Server\n(Zona Redundante, ENCRYPT_CONNECTION)"]
        KeyVault ["Azure Key Vault\n(Secrets, JWT Keys, DB Credentials)"]
        AppLogs ["Azure Monitor & Log Analytics\n(App Insights, Audit Logs)"]
    end

    subgraph ExternalIntegrations ["Integraciones Externas"]
        TalkIO ["TalkIO AI API\n(Servicio de Practica Oral Inteligente)"]
        GoogleCal ["Google Calendar API\n(Sincronizaci�n de Agenda y Calendarios)"]
    end

    Browser --> FdWaf
    FdWaf --> StaticApp
    FdWaf --> BackendApp
    StaticApp --> BackendApp
    BackendApp --> KeycloakApp
    BackendApp --> MySQLFlex
    BackendApp --> KeyVault
    BackendApp --> AppLogs
    BackendApp --> TalkIO
    BackendApp --> GoogleCal
``g

---

## 2. Script de Despliegue Automatizado con Azure CLI

```bash
#!/bin/bash
set -e

RESOURCE_GROUP="rg-iqenglish-prod"
LOCATION="eastus2"
ACR_NAME="acriqenglishtutoring"
CONTAINER_ENV="env-iqenglish-prod"
MYSQL_SERVER="mysql-iqenglish-prod"
KEYVAU7_NAME="kv-iqenglish-prod"

echo "1. Creando Grupo de Recursos..."
azrgroup create --name $RESOURCE_GROUP --location $LOCATION

echo "2. Creando Azure Key Vault..."
az keyvault create --name $KEYVAULT_NAME--resource-group $RESOURCE_GROUP --location $LOCATION
azpkeyvault secret set --vault-name $KEYVAULT_NAME --name "JwtSecret" --value "c2VjdXJlX2lxbXlzdGVyb3VzX10pdXRfemVkcmV0X2tleV9myjkgZW5nbGlzaF8yMDI2X0F1dGhlbnRpY2F0aW9uX3Rva2VuX1N5c3RlbV8yNTRiaXQ="

echo "3. Aprovisionando Azure Database for MySQL Flexible Server..."
azpmysql flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $MYSQL_SERVER \
  --location $LOCATION \
  --admin-user iquser \
  --admin-password "Passw0rdSecure2026!" \
  --sku-name Standard_B2s \
  --tier Burstable \
  --version 8.0 \
  --storage-size 32

echo "4. Despliegue de Backend en Azure Container Apps..."
az containerapp create \
  --name iq-backend-app \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image $ACR_NAME.azurecr.io/iq-backend:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --env-vars \
    SPRING_PROFILES_ACTIVE=prod \
    SPRING_DATASOURCE_URL="jdbc:mysql://$MYSQL_SERVER.mysql.database.azure.com:3306/iqnglish_db?useSSL=true&requireSSL=true" \
    SPRING_DATASOURCE_USERNAME=iquser \
    SPRING_DATASOURCE_PASSWORD="Passw0rdSecure2026!"

echo "Despliegue completado con exito en Microsoft Azure!"
```
