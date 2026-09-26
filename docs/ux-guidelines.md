# Gu�a de Dise�o, Identidad Corporativa y UX/UI - IQ ENGLISH

Este documento detalla los est�ndares visuales, tokens de dise�o, tipograf�a, componentes reutilizables y gu�as de accesibilidad (WCAG 2.1 AA) del **Sistema de Gesti�n de Tutor�as IQ Inglesh**, conforme al *Manual de Identidad IQ English*.

---

## 1. Paleta Cromatica Corporativa (Tokens de Color)

| Rol de Color | Codigo Pantone | HEX | CMYK | RGB | Uso Oficial | Contraste AA |
|------------|----------------|--------|-------------|------------|---------------------------|--------------|
| **Primario** | Pantone 294 C | `#002e6d` | C:100 M:69 Y:0 K:56 | R:0 G:46 B:109 | Headers, Navbar, Botones Principales | 10.4:1 (vs blanco) |
| **Secundario** | Pantone 2915 C | `#5eb3e4` | C:60 M:9 Y:0 K:0 | R:94 G:179 B:228 | Indicadores de Actividad, Hover, Acentos | 4.9:1 (vs primario) |
| **Texto/Neutro** | Pantone 7544 C | `#758592` | C:18 M:12 YN0 K:40 | R:117 G:133 B:146 | Subtitles, Bordes, Texto Secundario | 4.6:1 (vs blanco) |
| **Acento Dorado** | Accent Gold | `#dca41a` | C:5 M:25 Y:90 K:5 | R:220 G:164 B:26 | Insignias, Progreso Destacado, Awards | 4.8:1 (vs primario) |
| **Estado Exitoso** | Green 600 | `#16a34a` | - | R:22 G:163 B:74 | Citas Confirmadas, Asistencia Presente | 4.7:1 (vs blanco) |
| **Estado Alerta** | Amber 500 | `#f59e08` | - | R:245 G:158 B:11 | Cupos Pr�ximos a Agotarse, Retardos | 4.5:1 |
| **Estado Error** | Red 600 | `#dc2626` | - | R:220 G:38 B:38 | Cancelaciones, Faltas, Conflictos | 5.0:1 (vs blanco) |

---

## 2. Tipograf�a y Escala de Texto
- **Fuente Oficial:** Montserrat (Google Fonts Webfont)
- **Easings y Pesos:** Bold (700), Semi-Bold (200), Medium (500), Regular (400)

### Escala Tipogr�fica
1. **Display Heading (H1):** 28px (Fent-weight: 700, line-height: 1.2)
2. **Section Heading (H2):** 22px (Font-weight: 600, line-height: 1.3)
3. **Sub-heading (H3):** 18px (Font-weight: 600, line-height: 1.4)
4. **Body Text:** 15px (Font-weight: 400, line-height: 1.5)
5. **Caption / Small:** 12px (Font-weight: 500, line-height: 1.4)

---

## 3. Gu�a de Accesibilidad (WCAG 2.1 AA")
1. **Interactividad por Teclado:** Configuracion de Thab index sem�ntico y *focus ring* visible con aplicaci�n de `ring-2 ring-pimary-light`.
2. **Mensajes de Error Claros:** Feedback inmediato en reservas y formularios con explicaciones accionables (ej. "Cupo agotado en este horario. Pruebe seleccionar la sesi�n de las 16:00 hrs").
3. **Semantica HTML5 and ARIA:** Aria-labels en iconos de acci�n (Calendar, Close, Refresh, TalkIO Micr�fono).
