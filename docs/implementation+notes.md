# Slot Puzzle Prototype – Implementation Notes

Este prototipo es una **base inspirada en slots con mecánicas de caída tipo puzzle** (similar a Cygnus), pero **no es una copia**. Está listo para personalizar con tus assets.

## 🔹 Estructura
- **index.html** → Juego principal con Phaser 3.
- **Grid 6x6** de símbolos (actualmente: círculos de colores generados en runtime).
- **Botón SPIN** → Regenera todos los símbolos aleatoriamente.
- **Multiplicador lateral** → Aumenta con cada spin para simular progreso.

## 🔹 Cómo personalizar
1. Sustituye los sprites placeholders (`red`, `green`, `blue`, `yellow`) por tus propias ilustraciones.
   - Coloca tus PNG/JPG en una carpeta `assets/`.
   - Usa `this.load.image("key", "assets/mysymbol.png")` en `preload()`.

2. Ajusta la **grid**:
   - Cambia `this.cols` y `this.rows` para más o menos columnas/filas.
   - Cambia `this.symbolSize` para escalar.

3. Mejora el **multiplicador lateral**:
   - Puedes reemplazar el texto con una barra animada (ej. `Phaser.GameObjects.Rectangle` que crece).
   - O con un sprite de “barra de poder”.

4. Añade **animaciones de caída (gravity)**:
   - Usar `tweens` de Phaser para que los símbolos bajen con easing en vez de cambiar instantáneo.
   - Ejemplo: `this.tweens.add({ targets: sprite, y: newY, duration: 300, ease: "Bounce" });`

5. Implementa **sistemas de pago**:
   - Detectar combinaciones (tres o más símbolos iguales conectados).
   - Eliminar símbolos ganadores → dejar caer los de arriba → generar nuevos.
   - Subir multiplicador en cada cascada.

## 🔹 Próximos pasos
- Integrar **arte exclusivo 2D** (tu estilo, no genérico).
- Definir **RTP y matemáticas de slot** si planeas llevarlo a casinos.
- Añadir **UI completa**: balance, apuesta, botones de autoplay, etc.
- Exportar a **desktop/web** para demos con posibles socios.

---
