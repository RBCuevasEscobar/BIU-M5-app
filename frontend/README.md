# IQ English Tutoring Management System - Frontend

Este directorio contiene el codigo fuente y la documentacion tecnica de la arquitectura de interfaz de usuario (HCI, UX, IxD) para el sistema de gestion de tutorias **IQ English**.

## Documentacion Completa
Consulte el documento maestro de arquitectura, prototipado, diseno y pruebas:
- [DOCUMENTO_ARQUITECTURA_Y_DISENO_FRONTEND.md](./DOCUMENTO_ARQUITECTURA_Y_DISENO_FRONTEND.md)

## Componentes del Frontend
1. **Tecnologias Base:** React 18.3, TypeScript 5.5, Vite 8.3, React Router DOM 7.18.
2. **Gestion de Estado:** React Context (`AuthContext`) y TanStack React Query 5.56 para sincronizacion de cache del servidor.
3. **Diseno & HCI/UX:** Tokens de diseno CSS (`tokens.css`), Atomic Design, principios de Nielsen y accesibilidad universal WCAG 2.1 AA.
4. **Integracion de API REST:** Cliente tipado con interceptores JWT Bearer y manejo de errores semanticos (`ApiError`).
5. **Pruebas de Usabilidad & Automatizacion:** Evaluacion Heuristica, Metrica SUS (87.67/100), pruebas unitarias con Vitest y auditorias de rendimiento con Lighthouse.
