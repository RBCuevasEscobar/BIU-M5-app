# IQ English Tutoring Management System - Backend

Este directorio contiene el codigo fuente y la documentacion tecnica de la arquitectura de backend para el sistema de gestion de tutorias **IQ English**.

## Documentacion Completa
Consulte el documento maestro de arquitectura, diseno tecnico y pruebas:
- [DOCUMENTO_ARQUITECTURA_Y_DISENO_BACKEND.md](./DOCUMENTO_ARQUITECTURA_Y_DISENO_BACKEND.md)

## Componentes del Backend
1. **Controladores REST:** Modulos de autenticacion, usuarios, grupos, sesiones, citas, asistencia y catalogos.
2. **Persistencia & JPA:** Modelos de dominio, repositorios Spring Data JPA, pool HikariCP y base de datos MySQL 8.0 / H2.
3. **Seguridad RBAC & JWT:** Interceptores de autenticacion stateless, hashing con BCrypt y roles granulares.
4. **Pruebas Automatizadas:** Suites completas con JUnit 5, Mockito y MockMvc.
5. **Configuracion & Despliegue:** Maven (`pom.xml`), Dockerfile multi-stage y Docker Compose.
