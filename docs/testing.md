# Estrategia de Pruebas, Automatizaci�n y Calidad (QA) - IQ ENGLISH

Este documento especifica la estrategia de calidad del **Sistema de Gesti�n de Tutor�as IQ English**, abarcando la Pir�mide de Pruebas, cobertura con JUnit 5 + Mockito, Vitest en Frontend y End-to-End con Playwright.

---

## 1. Pir�mide de Pruebas del Proyecto

1. **Pruebas Unitarias (Backend & Frontend) (70% peso):** Verificaci�n aislada de reglas de negocio, calculo de cupos, traducci�n de RBAC y renderizado de componentes.
2. **Pruebas de Integraci�n (20% peso):** Valisteda de controlladores REST, flujo transaccional con base de datos relacional, Flyway migraciones y fronteras de rollback.
3. **Pruebas End-to-End (E2E) (10% peso):** Flujos completos desde el navegador mediante Playwright abarcando roles de Estudiante, Docente, Supervisor y Administrador.

---

## 2. Suites de Pruebas en Backend (JUnit 5 + Mockito)

| Suite de Pruebas | Clase Test | Reglas / Funcionalidad verificada | Estado |
|------------------|--------------------------|--------------------------------------|---------|
| **Aq�����ѵ���M��٥��Q��Ш����������ѵ���M��٥��Q��й��ف����HĀ�9��ͽ��������Ѽ���HȀ�M���������Ѽ������є���H̀������ፕ���������AMM���������)����I�������I��Ʌ�ͅ�ѥ��Q��Ш����������ѵ���M��٥��Q��й��ف����H����I�����������Ѽ���͵��������ɽ�������ѽх����є���������AMM���������)����M��ͥ���������Q��Ш�����Q�ѽɥ��ɽ��M��٥��Q��й��م����H԰�H؀�ɕ���͸���������̰�����Ʌ����ɕ���ɕ�є���AMM���������)����I���A�ɵ��ͥ���Q��Ш�����M���ɥ��I���Q��й��ف����5���������́��ɵ�ͽ̰�ɽ��́�����Յɥ����Ʌ��́���AMM���������((���((���̸�Mեѕ́���A�Օ��́���ɽ�ѕ����Y�ѕ�Ф(��Y�ɥ������͸����ѽ���́�������ȁA��ѽ�����Ё��A��ѽ������ԁ��A��ѽ������Ё���Ʌ���(��I����ɥ酑�������������ѕ́�����ѕə�耡	����̰��ɑ̰�	��ѽ�̰�5����̤�((���((���и�Mեѕ́���A�Օ��́���Ѽ�����A����ɥ��Ф(��������訨�1�����������Ց���є�䁹�ٕ����������͡���ɐ�(�������訨��թ�����ɕ͕�ل������ѽ˵����ȁ7�ѽ�����7�ѽ����(�������訨�%��ɕͼ����������є����͔�������ф�(��������訨�A˅�ѥ����Ʌ��������ٕ�ͅ��͸�����Q���%<�(��������訨����ͼ������������Ʌ��ȁ�����́����Ց�ѽ˵��䁝���͸���������̸(