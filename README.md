# 🎰 Orden of Lords - The Puzzle Game

Un proyecto de juegos de puzzle inspirado en mecánicas de slot con elementos de estrategia, criaturas elementales y sistemas de cascadas.

---

## 📋 Tabla de Contenidos

- [Estado Actual](#-estado-actual)
- [Inicio Rápido](#-inicio-rápido)
- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación](#-documentación)
- [Deployment](#-deployment)
- [Desarrollo](#-desarrollo)
- [Concepto: Orden of Lords](#-concepto-orden-of-lords)
- [Licencia](#-licencia)

---

## 🎮 Estado Actual

### ✅ Implementado: Juego Estilo Cygnus 6

Actualmente el proyecto cuenta con un **juego de slot profesional** completamente funcional inspirado en Cygnus 6 de ELK Studios:

- ✨ Símbolos con bordes circulares dorados y efectos de brillo
- 🎲 Grid de 6×4 con mecánica de cascadas
- 💰 Sistema profesional de apuestas (£0.20-£10.00)
- 📈 Multiplicadores incrementales por cascada
- 🎨 Tema de fantasía con paisaje y columnas de ruinas
- 🎯 Detección de matches (3+ símbolos conectados)
- ⚡ Animaciones suaves de caída, rebote y eliminación

**¿Cómo jugar?**
1. Revisa tu balance (inicia en £100.00)
2. Ajusta tu apuesta con el botón "⚙️ CHANGE BET"
3. Presiona "SPIN" para jugar
4. Disfruta las cascadas con multiplicadores crecientes
5. ¡Acumula ganancias!

📖 **Guía completa:** Ver [`docs/QUICK_START.md`](docs/QUICK_START.md)

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en **http://localhost:5173**

### Build de Producción

```bash
# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

---

## ✨ Características Principales

### Juego Cygnus 6-Style (Implementado)

#### 🎨 Diseño Visual
- **Símbolos dorados**: Bordes circulares gruesos (#FFD700) con efecto de brillo exterior (#FFA500)
- **Fondo de fantasía**: Paisaje completo de pantalla
- **Marco de ruinas**: Columnas antiguas alrededor del tablero de juego
- **4 mascotas elementales**: Personajes únicos en cada símbolo

#### 🎮 Mecánicas de Juego
- **Grid 6×4**: 6 columnas, 4 filas (celdas de 64px)
- **Detección de Matches**: 3+ símbolos idénticos conectados ortogonalmente
- **Sistema de Cascadas**: Eliminación automática → gravedad → rellenado → repetir
- **Multiplicador Incremental**: x1 → x2 → x3... aumenta con cada cascada
- **Física de Gravedad**: Los símbolos caen de forma natural

#### 💎 UI Profesional de Casino
- **Panel izquierdo** con estadísticas:
  - Balance: £100.00 (inicial)
  - Apuesta: £1.00 (predeterminada)
  - Giros Gratis: 0
  - Multiplicador: x1
- **Modal de Apuestas**: 8 valores fijos en GBP (£0.20 a £10.00)
- **Botones interactivos**: SPIN y CHANGE BET con efectos hover

#### 📊 Lógica del Juego
- Deducción de balance en cada giro (excepto giros gratis)
- Cálculo de ganancias: (tamaño_grupo - 2) × apuesta × multiplicador
- Display animado de victorias
- Prevención de giro con balance insuficiente

---

## 🛠️ Tecnologías

### Stack Principal
- **Phaser 3.90.0** - Motor de juego con renderizado WebGL
- **React 19.2.0** - Framework de UI
- **TypeScript 5.9.3** - Desarrollo type-safe
- **Vite 7.3.1** - Build tool y dev server

### Herramientas de Desarrollo
- **ESLint 9.39.1** - Linting de código
- **TypeScript ESLint** - Reglas específicas de TS
- **React Refresh** - Hot Module Replacement

---

## 📁 Estructura del Proyecto

```
OrdenOFlordsThePuzzleGame/
├── src/
│   ├── scenes/
│   │   └── GameScene.tsx       # Lógica principal del juego (664 líneas)
│   ├── components/             # Componentes React
│   ├── GameCanvas.tsx          # Wrapper de Phaser en React
│   ├── App.tsx                 # Aplicación principal
│   └── main.tsx                # Punto de entrada
├── public/
│   └── assets/
│       ├── fantasy landscape co.png   # Fondo
│       ├── ruin_columns.png           # Marco del tablero
│       ├── macota1.png                # Símbolo 1
│       ├── mascota2.png               # Símbolo 2
│       ├── mascota3.png               # Símbolo 3
│       └── mascota4.png               # Símbolo 4
├── docs/
│   ├── QUICK_START.md          # Guía de inicio rápido
│   ├── GAME_IMPLEMENTATION.md  # Documentación técnica completa
│   ├── VISUAL_LAYOUT.md        # Guía de diseño visual
│   └── *.md                    # Notas de diseño y conceptos
├── demo_slot/
│   └── index.html              # Demo de referencia
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                   # Este archivo
```

---

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo (puerto 5173)

# Producción
npm run build        # Compila TypeScript + build de Vite
npm run preview      # Previsualiza build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint en todo el proyecto
```

---

## 📚 Documentación

La documentación completa está disponible en el directorio [`docs/`](docs/):

1. **[QUICK_START.md](docs/QUICK_START.md)**
   - Guía de inicio rápido
   - Instrucciones de juego
   - Reglas y mecánicas básicas

2. **[GAME_IMPLEMENTATION.md](docs/GAME_IMPLEMENTATION.md)**
   - Documentación técnica completa
   - Arquitectura del código
   - Métodos y estructuras de datos
   - Notas de rendimiento

3. **[VISUAL_LAYOUT.md](docs/VISUAL_LAYOUT.md)**
   - Guía de diseño visual
   - Diagramas ASCII del layout
   - Especificaciones de tipografía
   - Paleta de colores
   - Detalles de animaciones

4. **[TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md)** 🆕
   - Configuración de notificaciones de Telegram
   - Integración con GitHub Actions
   - Guía paso a paso completa

---

## 🌐 Deployment

### GitHub Pages

El proyecto está configurado para **deployment automático** a GitHub Pages:

🔗 **URL del juego:** `https://pilukarts.github.io/OrdenOFlordsThePuzzleGame/`

#### Configuración Automática

El proyecto usa **GitHub Actions** para deployment automático:
- ✅ Se activa automáticamente con cada push a las branches `main` o `copilot/create-cygnus-6-style-game`
- ✅ Build y deployment automáticos
- ✅ No requiere configuración manual
- ✅ URL estable y permanente

#### Deployment Manual

Si necesitas hacer un deployment manual:

```bash
# 1. Build del proyecto
npm run build

# 2. El contenido está en la carpeta dist/
# 3. GitHub Actions lo desplegará automáticamente al hacer push
```

#### Ver el Workflow

Puedes ver el estado del deployment en:
- **GitHub Actions**: `https://github.com/pilukarts/OrdenOFlordsThePuzzleGame/actions`
- **Archivo del workflow**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### 📱 Notificaciones de Telegram (Opcional)

El proyecto incluye soporte para **notificaciones de Telegram** cuando ocurre un deployment:

- ✅ Notificaciones de éxito con URL del sitio
- ❌ Alertas de errores si falla el deployment
- 🔧 Fácil de activar/desactivar

**Para configurar:** Ver la guía completa en [`docs/TELEGRAM_SETUP.md`](docs/TELEGRAM_SETUP.md)

**Estado actual:** 💤 Desactivado por defecto (comentado en el workflow)

---

## 💻 Desarrollo

### Configuración del Entorno

El proyecto usa **Vite + React** con configuración optimizada para desarrollo:

- **Fast Refresh**: Actualizaciones instantáneas durante desarrollo
- **TypeScript**: Type checking completo
- **ESLint**: Linting con reglas para React y TypeScript
- **WebGL**: Renderizado acelerado por hardware con Phaser

### Expandir Configuración de ESLint

Para aplicaciones de producción, se recomienda habilitar reglas de linting type-aware:

```js
// eslint.config.js
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    parserOptions: {
      project: true,
      tsconfigRootDir: __dirname,
    },
  },
]
```

**Opciones adicionales:**
- Reemplazar `plugin:@typescript-eslint/recommended` con `plugin:@typescript-eslint/recommended-type-checked`
- Agregar `plugin:@typescript-eslint/stylistic-type-checked`
- Instalar `eslint-plugin-react` y agregar `plugin:react/recommended` & `plugin:react/jsx-runtime`

### Plugins de Vite

Dos plugins oficiales disponibles:

- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** - Usa Babel para Fast Refresh (actual)
- **[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)** - Usa SWC para Fast Refresh (alternativa más rápida)

---

## 🌟 Concepto: Orden of Lords

### Visión del Juego Completo

**Orden of Lords** es el concepto de juego completo planeado: un universo donde cuatro mascotas elementales buscan sus gemas para activar a los poderosos *Lords*.

#### 🧩 Mecánicas Planeadas

**Tablero:**
- 6 o 7 filas
- Gemas caen como lluvia (estilo Cygnus)
- Colores elementales: 🔥 Rojo, 💧 Azul, 🍃 Verde, 🌬️ Amarillo
- Game Over si el tablero se llena

**Mascotas Elementales:**
- Cada una baja por su carril cuando se activan 3 gemas de su color
- Suben buscando gemas bonus
- Pueden fallar, creando estrategia
- Se cruzan con otras → **Battle**

**Lords:**
- Aparecen cuando una mascota activa 3 gemas
- Generan 3 gemas bonus en posiciones estratégicas
- Bonus Triple: alineación de 3 gemas bonus
- Bonus Épico: activar los 4 Lords (12 gemas bonus)

**⚔️ Battles:**
- Battle (2 mascotas)
- Triple Battle (3 mascotas)
- Ultra Battle (4 mascotas)
- Reorganizan el tablero

**🪙 Sistema de Coins:**
- +10 coins por gema bonus
- +50 coins por bonus triple
- +200 coins por bonus épico
- Los coins persisten incluso al perder

#### 🎨 Identidad Visual
- Logo con pilares mágicos
- Cuatro esferas elementales
- Suelo de piedra
- Pilares con enredaderas
- Estética mística y elegante

### 📌 Estado de Desarrollo

**✅ Completado:**
- Mecánica de cascadas
- Sistema de apuestas profesional
- Interfaz de usuario estilo casino
- Detección de matches
- Multiplicadores incrementales
- Animaciones suaves

**🔄 En Conceptualización:**
- Sistema de Lords y mascotas
- Mecánica de battles
- Sistema de gemas bonus
- Sistema de coins persistente
- Expansión del tablero dinámico

---

## 🔒 Licencia

Proyecto creativo original. Todos los derechos reservados.

---

## 🤝 Contribución

Este es un proyecto en desarrollo activo. Para consultas sobre colaboración o uso del código, por favor contacta al propietario del repositorio.

---

## 📞 Soporte

Para más información, consulta la documentación en el directorio [`docs/`](docs/) o revisa los archivos de implementación en [`src/scenes/`](src/scenes/).

---

<div align="center">

**Hecho con ❤️ usando Phaser, React y TypeScript**

</div>
