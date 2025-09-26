# Requisitos para adaptar el juego a Video Slot de Casino

Este documento lista las áreas críticas que deben ser añadidas o reforzadas para transformar el prototipo en un **video slot** apto para casinos.

| Área | Qué necesitas / adaptar | Por qué es necesario |
| --- | --- | --- |
| **Motor de giro / RNG y matemática de juego** | Introducir un sistema de **Random Number Generator** certificado, definir tablas de pagos, probabilidades de símbolos, hit frequency, volatilidad, RTP (Return To Player). | Los casinos requieren que el juego sea justo y medible. El RNG debe certificar que no hay manipulación y que los pagos responden a probabilidades predefinidas. |
| **Integración de “spins” / giros con líneas de pago** | Adaptar la mecánica de match-3 a carretes y combinaciones de slot. | Los slots tradicionales tienen carretes, líneas, símbolos y reglas de combinación — los casinos esperan esa estructura. |
| **Bonus rounds / rondas especiales** | Definir giros gratis, multiplicadores, símbolos wild/scatter, etc. | Parte esencial de la experiencia de slots. |
| **Monetización / apuestas / stakes** | Sistema de apuesta por giro, límites, balance de usuario. | En un casino, cada giro es una apuesta real. |
| **Seguridad / certificaciones** | Backend seguro, RNG auditado, certificación GLI/iTech Labs. | Requisito de operadores de casino. |
| **Balance / RTP visible** | Mostrar RTP global, ocultar manipulación de pagos. | Cumplimiento normativo y confianza del jugador. |
| **Reportes y auditoría** | Logs, estadísticas, detección de fraude. | Reguladores lo exigen. |
| **Integración con plataformas de casino** | APIs estándar (G2S, JSON, CMS de casino). | Para que el juego pueda conectarse a casinos o agregadores. |
| **Cumplimiento regulatorio regional** | Licencias, restricciones de edad, protección al jugador. | Obligatorio según la jurisdicción. |

---

### Próximos pasos

1. Diseñar la matemática del juego (símbolos, pagos, RTP, volatilidad).  
2. Adaptar el motor actual de puzzle a mecánica de carretes con RNG.  
3. Implementar sistema de apuestas y balance de usuario.  
4. Migrar lógica crítica a backend y reforzar seguridad.  
5. Preparar demo jugable con UI/UX estilo slot.  
6. Documentar para certificación y contactar agregadores.  
