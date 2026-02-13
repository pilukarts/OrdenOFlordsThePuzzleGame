# Vite + React

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware linting rules:

- Configure the top-level `parserOptions` property like this:

```js
export default [
  //...
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    parserOptions: {
      project: true,
      tsconfigRootDir: __dirname,
    },
  },
]
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install `eslint-plugin-react` and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

---

# Orden of Lords
Un juego de puzzle–estrategia con criaturas elementales, pilares mágicos y un sistema único de bonus inspirado en mecánicas de lluvia de gemas, batallas y activación de Lords.

## 🌟 Descripción general
**Orden of Lords** es un universo donde cuatro mascotas elementales buscan sus gemas para activar a los poderosos *Lords*.  
El jugador interactúa con un tablero de 6 o 7 filas donde las gemas caen como lluvia, creando un ritmo táctico y controlado.  
El objetivo es activar combos, evitar que el tablero se llene y desatar el poder de los cuatro Lords.

## 🧩 Mecánicas principales

### 🔹 Tablero
- 6 o 7 filas.
- Las gemas **no rellenan todo el tablero**: caen como lluvia, estilo Cygnus.
- Colores elementales: rojo, azul, verde, amarillo.
- Si el tablero se llena completamente, el jugador **pierde**.

### 🔹 Mascotas
Cuatro criaturas elementales:
- 🔥 Fuego (rojo)
- 💧 Agua (azul)
- 🍃 Tierra (verde)
- 🌬️ Aire (amarillo)

Cada mascota:
- Baja por su carril vertical cuando se activan 3 gemas de su color.
- Sube buscando sus gemas bonus.
- Puede fallar en recogerlas, creando estrategia y caos controlado.
- Puede cruzarse con otras mascotas → **Battle**.

### 🔹 Lords
Cuando una mascota activa 3 gemas de su color:
- Aparece su **Lord elemental**.
- El Lord genera **3 gemas bonus** colocadas en posiciones estratégicas:
  - Tablero de 6 filas → filas 1, 3, 5.
  - Tablero de 7 filas → filas 1, 4, 7.

Si las 3 gemas bonus se alinean:
- Se activa un **BONUS TRIPLE** con efectos especiales.

Si los 4 Lords aparecen:
- Se activa el **BONUS ÉPICO** con 12 gemas bonus.

## ⚔️ Battles
Cuando dos o más mascotas se cruzan en el carril horizontal:
- Se activa una batalla elemental.
- Pueden ocurrir:
  - Battle (2 mascotas)
  - Triple Battle (3 mascotas)
  - Ultra Battle (4 mascotas)

Los battles reorganizan el tablero y pueden salvar al jugador del colapso.

## 🪙 Sistema de Coins
- +10 coins por cada gema bonus activada.
- +50 coins por activar las 3 gemas bonus de un Lord.
- +200 coins por activar los 4 Lords (12 gemas bonus).
- Los coins se conservan incluso si el jugador pierde.

## 🎨 Identidad visual
- Logo con pilares mágicos.
- Cuatro esferas elementales (rojo, azul, verde, amarillo).
- Suelo de piedra donde descansa el título.
- Pilares con enredaderas en el lado sin esferas.
- Estética mística, elegante y de fantasía.

## 📌 Estado del proyecto
En desarrollo conceptual.  
Incluye:
- Diseño del logo.
- Mecánicas principales.
- Sistema de bonus.
- Sistema de batalla.
- Flujo general del juego.

## 📚 Licencia
Proyecto creativo original con copyright.
