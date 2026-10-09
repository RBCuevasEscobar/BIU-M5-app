# IQ English Tutoring Management System - Evaluacion y Pruebas (QA)

Este directorio contiene la documentacion tecnica y especificacion detallada de la evaluacion y pruebas para el sistema de gestion de tutorias **IQ English**.

## Documentacion Completa de Pruebas
Consulte el documento maestro de especificacion y resultados de pruebas:
- [DOCUMENTO_EVALUACION_Y_PRUEBAS.md](./DOCUMENTO_EVALUACION_Y_PRUEBAS.md)

## Alcance de las Pruebas Documentadas
1. **Ingreso de Datos & Validaciones:** Pruebas de formularios, navegacion y reglas de negocio.
2. **Autenticacion & Seguridad RBAC:** Evaluacion de tokens JWT y permisos a nivel de metodo.
3. **Integracion API:** Contratos REST, Google Calendar API y TalkIO Platform.
4. **Usabilidad & Accesibilidad:** Evaluacion Heuristica, Metrica SUS (87.67/100) y WCAG 2.1 Nivel AA (98/100).
5. **Carga, Rendimiento & Responsividad:** Carga concurrente p95 < 120ms y Core Web Vitals (LCP < 1.2s).
6. **Personalizacion & Alertas:** Notificaciones, configuraciones y bitacora de auditoria.
