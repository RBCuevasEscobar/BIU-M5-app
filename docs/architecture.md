# Arquitectura de Software y Dise�o del Sistema - IQ ENGLISH TUTORING LMS

Este documento proporciona una especificaci�n arquitect�nica exhaustiva del **Sistema de Gesti�n de Tutor�as Acad�micas de IQ English**. Ha sido dise�ado para operar bajo plataformas cloud-native (Preparado para Microsoft Azure), garantizando alta disponibilidad, acuerdos de nivel de servicio (SLA) superiores al 99.9%, acumulaci�n transaccional ACID con aislamiento SERIALIZABLE en reservas, y seguridad RBAC con OAuth 2.0 y JWT.

---

## 1. Visisn General y Principios de Arquitectura

La plataforma sigue los principios de *Domain-Driven Design* (DDD), arquitectura limpia *Clean Architecture* en capas respetuosas de *SOLID*, y separaci�n estricta de responsabilidades entre capas (UI Presentation, API Gateway, Application Services, Domain Logic, Persistence & External Integrations).

<!t-DIAGRAM 1: Architecture Global (C4 Level 2 - Containers) -->
code:
{{#diagram 1}}
```mermaid
flowchart TD
    subgraph ClientsArea ["Capa de Usuarios y Clientes"]
        StudentApp["Navegador Estudiante\n(React 18 + Vite + TS 5)"]
        TeacherApp["Navegador Docente\n(React 18 + Vite + TS 5)"]
        AdminApp["Panel Supervisor/Admin\n(React 18 + Vite + TS 5)"]
    end

    subgraph EdgeGateway ["Capa de Edge & Reverse Proxy"]
        NginxGw ["Nginx Reverse Proxy / Azure Front Door\n(SSL/TLS 1.3, Gzip/Brotli, CORS, Security Headers)"]
    end

    subgraph SecurityLayer ["Security & Authorization Chain"]
        SpringSecurity["Spring Security 6.3 Filter Chain\nJWT Bearer AuthenticationFilter\nRBAC (43 Permisos, 4 Roles)]
    end

    subgraph BackendApplication ["Capa de Aplicaci�n (Java 21 & Spring Boot 3.3.4)"]
        REST_API[
Controllers REST OpenAPI 3.0
]
        AppointmentSvc[
Appointment Service
[Reglas R1-R18, Horarios, Cupos,
Atomic Reschedule & Rollback]
]]
        GroupSvc[
Group Service & GroupSessionService
[Generaci�n Recurrente, planteles]
]]�][�[��Tݘ��B�][�[��T�\��X�H	�X�Y[ZX���ܙ\��ݘ�B��\�HH\�K]�[XX�|ۋ]�[��WCB�WB�Y\\���B�]Y]�\��X�H	���Y�X�][۔�\��X�CB�����[�]]X�\�[XZ[��XZ����CB�WB�[����X�ܘ\[�Yܘ][ۜ�^Y\�Ȑ�\HH[�YܘX�[ۙ\�^\��\ȗB�[�S��Y[�ȕ[�S�RHܘ[�X�X�HTH�Y[���T��Y[���X��Y[�
H�B��[[�\��Y[�ȑ����H�[[�\��P�[�\��X�W�ٙ��]�[��]�[��H�B�[����X�ܘ\]T�ܙS^Y\�Ȑ�\HH\��\�[��XH][KQ[�ܛ�ȗB�^T�S��ȓ^T�S��͈
��
H��L�[�Y[[ܞH�
\��]�W�M�X�\��[X�[ۘ[\��]�^H�H	����B�[����Y[�\KO���[��XX�\�\KO���[��YZ[�\KO���[����[���KO���[���X�\�]B���[���X�\�]HKO��T��T\�T��T\�KO�\�[�Y[�ݘ�T��T\�KO�ܛ�\ݘ�T��T\�KO�][�[��Tݘ�T��T\�KO�Y\\�\�[�Y[�ݘ�KO�[�S��Y[��\�[�Y[�ݘ�KO��[[�\��Y[��\�[�Y[�ݘ�KO�^T�S���ܛ�\ݘ�KO�^T�S���][�[��Tݘ�KO�^T�S���Y\\��KO�^T�S����KKB������\�ܚ\�[ۈ][YHH����\ۙ[�\�[�\�[XB��KKHPQԐSH����\ۙ[��
�H]�[�HKO��Y\�XZY��\��XYܘ[B��\��\�[�Y[��۝��\�
��X\��\�[�Y[��
B�
؛���\�[�Y[�

B�
ܙ\��Y[P\�[�Y[�

B�
��[��[\�[�Y[�

B�B��\��\�[�Y[��\��X�H
؛���\�[�Y[�

B�
ܙ\��Y[P\�[�Y[�

B�X�X���ۙ�X��
B�X�X���\X�]J
B�B��\��ܛ�\�\��[۔�\��X�H
��[�\�]T�\��[ۜћܑܛ�\

B�
��]\�ۚX�[]J
B�B��\��][�[��T�\��X�H
ܙY�\�\�][�[��J
B�
��]�Y[��]�
B�B��\��[�S��\��X�H
�[�]X]T�X�X�J
B�
�]�[X]T�\�ۜ�J
B�B��\��]Y]�\��X�H
���X�[ۊ
B�
��]X�[ۜОU\�\�
B�B��\�[�Y[��۝��\�KO�\�[�Y[��\��X�B�\�[�Y[��\��X�HKO�ܛ�\�\��[۔�\��X�B�\�[�Y[��\��X�HKO�[�S��\��X�B�\�[�Y[��\��X�HKO�]Y]�\��X�B�][�[��T�\��X�HKO�]Y]�\��X�B���KKB����ˈ[�[Y�H�Z���H�X�Y[��XHܻ]X������ˌK��Z��H�\�\��HH]ܻXH
Y]�HHY]��B��KKHPQԐSHN��TUQS��HH����S�����KO��Y\�XZY��\]Y[��QXYܘ[B�]]۝[X�\��X�܈�Y[�\�\�YX[�B�\�X�\[���۝[�\��XX�N�B�\�X�\[�\��\�\�[�Y[��۝��\��\�X�\[�\ݘ�\�\�[�Y[��\��X�B�\�X�\[��\��[۔�\�\�ܛ�\�\��[۔�\��]ܞB�\�X�\[�\�\�\�\�[�Y[��\��]ܞB�\�X�\[�[�S�\�[�S��Y[��\�X�\[��[[�\�\��[[�\��\��X�B�\�X�\[�]Y]\�]Y]�\��X�B���Y[�O����۝[���[X��[ۘH[XH
����H��H��HH�\�[ۙ\��۝[�O��\������\K݌K�\�[�Y[��؛���
�\��[ےY�X�Y
B�\��O��\ݘΈ����\�[�Y[�
�Y[�Y�\��[ےY�X�Y
B�\ݘ�O���\��[۔�\Έ�[��RY�]\��[Z\�X�����\��[ےY
B��\��[۔�\�KO��\ݘΈܛ�\�\��[ۈ
�\X�]N�K����Y��B�\ݘ�O��\ݘΈ�[YH�H
����\[ZY[��H	���
�\��\X�YY
B�\ݘ�O��\�\Έ�]�H�]�\�[�Y[�
�ӑ�T�QQ
B�\ݘ�O���\��[۔�\Έ[�ܙ[Y[�����Y���[�

B�\ݘ�O��[�SΈ�\\�Sܘ[�X�X�U�X��X�Y
B�\ݘ�O���[[�\��ܙX]P�[[�\�]�[�
\�[�Y[�
B�\ݘ�O��]Y]���X�[ۊ	Г����T�QS�	��Y[�Y\�[�Y[�Y
B�\ݘ�KO��\���\�[�Y[��
�X��\��B�\��KO����۝[���HܙX]Y
^[�Y
B���۝[�KO���Y[��]Y\��H�\�H�\�\��H^]��H�ۈ��ۙ\�[�S�H�[[�\���KKB�����ˌ���Z��H�XY�[�[ZY[��]<�ZX���ۈ���X��
�Y�H�L
B��KKHPQԐSH���TUQS��HHU�RP��T��QSS�����KO��Y\�XZY��\]Y[��QXYܘ[B�]]۝[X�\��X�܈�Y[�\�\�YX[�B�\�X�\[���۝[�\��XX�N�B�\�X�\[�\ݘ�\�\�[�Y[��\��X�H
�[��X�[ۘ[
B�\�X�\[���\��[ۈ\��\�[ۈ[�\�[܂�\�X�\[��]��\��[ۈ\��\�[ۈ�Y]�B�\�X�\[�\�\�\�\�[�Y[��\��]ܞB���Y[�O����۝[����X�]H�XY�[�\�H�\�[ۈHH�\�[ۈ����۝[�O��\ݘΈ���\K݌K�\�[�Y[��ܙ\��Y[H
�Y�]��\��[ےY
B���Hݙ\�\ݘΈ[�X�[�H�[��X��|ۈ�T�PSV�P�B�\ݘ�O���]��\��[ێ��\�Y�X�H\�ۚX�[YYH�\�X��B�[�\�\�ۚX�H[��]��\��[ۂ�\ݘ�O���]��\��[ێ�[�ܙ[Y[�H����Y���[�
�\ݘ�O����\��[ێ�Xܙ[Y[�H����Y���[�KH
X�\�H�\�B�\ݘ�O��\�\ΈX\��H�\�[�Y[���[��T��QSQHܙXH�]�\�[�Y[��ӑ�T�QQ�\ݘ�KO����۝[�����
�XY�[�[ZY[��^]���B�[�H�\�Y��Y���ۙ�X��H��\[ZY[�\ݘ�O��\ݘΈ�Q��T����P��B���Hݙ\�\ݘΈH�]HܚY�[�[\�X[�X�H�ӑ�T�QQH���HX�\�H�H�\\ݘ�KO����۝[��H�ۙ�X�
�\��܈H�XY�[�[ZY[�Έ�\�Y��YȊB�[����KKB�����ˌˈ�Z��HܙXX�|ۈHܝ\��H�\�[ۙ\��X�\��[�\�
�Y�\��K��B��KKHPQԐSHΈ�TUQS��HHԑPUS��ԓ�TS��T��SӔ�KO��Y\�XZY��\]Y[��QXYܘ[B�]]۝[X�\��X�܈YZ[�\�YZ[�\��Y܈��\\��\�܂�\�X�\[�RH\��XX���۝[��\�X�\[���\�]ܚ[��ܛ�\�۝��\��\�X�\[�ݘ�\�]ܚ[��ܛ�\�\��X�B�\�X�\[��\�\�ܛ�\�\��[۔�\��]ܞB�\�X�\[��\�^T�S���YZ[�O��RN��[X��[ۘH[�[�ٙ\�܋X���XKܘ\�[�H�\X�YY
^��JB�RKO��������\K݌K�ܛ�\�
ܙX]T�\]Y\�
B���O��ݘΈܙX]Qܛ�\
�\]Y\�
B�ݘ�O��ݘΈ�[YH�ٙ\�܈\�ۚX�HH�[��؜�\��X�|ۈ
^Sٕ�YZ�[Y\�B�ݘ�O���\Έ�]�H]ܚ[��ܛ�\��\�O����S��T�S��]ܚ[���ܛ�\ݘ�O��ݘΈ�[�\�H�\�[ۙ\��X�\��[�\�
L��[X[�\�H�[[�\�[�B�ݘ�O���\Έ�]�P[ܛ�\�\��[ۜ�\�O����S��T�S��ܛ�\��\��[ۜݘ�KO�����]ܚ[��ܛ�\�\�ۜ�H
�X��\��B���KO��RN��HܙX]Y
�]B�RKKO��YZ[��]Y\��H�ۙ�\�XX�|ۈHܝ\�[�[[�[��KKB�����[�YܘX�[ۙ\�H\��\���H[����]�[��Y�K�
��[�S�ܘ[�X�X�HTN����\��X�[��\�Y�[�PHH���\�[ZY[��H�ވH�۝[��XX�|ۋ��X[��[�[[[���\�\��H[�[XK[�\�[XH�[�\�H]]�x]X�[Y[�H[���H�X�X�H�ۈ�ܛ][X�|ۈH�Y�[�\�]�[XX�|ۈH�ZY^�
LL
HH�YY�X���ۺ]X�˂���
������H�[[�\�	�P�[�
��X���X��|ۈH�[[�\�[�[�XYHYYX[�H^[�ː�[[�\�[�Yܘ][۔�\��X�X\�Z]Y[��H�[�\�X�|ۈH�X�\����X��H\�X��H]�[���H����H�[[�\�TH�˂��KKB����K��\�[�;X\�H�ۘ�\��[��XKP�QHZ]Y�X�|ۈH�[���؛[XHH�ۘ�\��[��XH�Y\���\���XY�YX�[�\�[�HZ]Y�X�|ۈ[�TH[��\��KKKKKKKKKKKKKKKKKKKKKK_KKKKKKKKKKKKKKKK_KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK_�
���X�H����[���؜�H�\��[�[
����[[[�����\[�[-[[��\�HHZ\�[ZY[���T�PSV�P�HH��]Y[�\�[Z\�H[�[ݚYY���[��
���[�[��XY�[�[ZY[�ʊ��]H[�\�[܈�ܜ�YH�[��Y]�H�]HX�]�H]�ZX��\��Y[[���ۈ���X���Y�Y�܈�Y�H�L�
����\[ZY[��H�ٙ\�܊��[���[�H\�YۘY�H�\�[ۙ\��[][8[�X\��[YX�|ۈHܘ\�[��[�]ܚ[���ܛ�\�H�]\�\��[ۜ��
��[��ۜ�\�[��XHH]�[��HX�Y8[ZX�ʊ�\�HH\�H�[��Y�Z��[��]�[�[��X��pۈ��][�YH][�[��H
�X�Y[ZX���ܙ\��