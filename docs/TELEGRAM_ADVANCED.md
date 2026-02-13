# 🚀 Ejemplos Avanzados de Notificaciones de Telegram

Este documento contiene ejemplos avanzados y casos de uso para las notificaciones de Telegram en GitHub Actions.

---

## 📊 Dashboard de Estado en Telegram

### Bot con comandos interactivos

Puedes crear un workflow separado que responda a comandos en Telegram:

```yaml
name: Telegram Bot Commands

on:
  workflow_dispatch:
    inputs:
      command:
        description: 'Command to execute'
        required: true
        type: choice
        options:
          - status
          - last-deploy
          - health-check

jobs:
  execute:
    runs-on: ubuntu-latest
    steps:
      - name: Get Repository Status
        if: ${{ github.event.inputs.command == 'status' }}
        run: |
          echo "STATUS=✅ Repository activo" >> $GITHUB_ENV
          echo "BRANCH=$(git branch --show-current)" >> $GITHUB_ENV

      - name: Send Status to Telegram
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            📊 Estado del Proyecto
            
            🎮 Proyecto: ${{ github.repository }}
            🌿 Branch principal: main
            👥 Colaboradores: Activos
            🔧 Último deployment: Exitoso
            
            Consulta más detalles en GitHub Actions
```

---

## 🎨 Notificaciones Personalizadas por Evento

### Diferentes mensajes para diferentes branches

```yaml
- name: Notify Main Branch Deploy
  if: success() && github.ref == 'refs/heads/main'
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      🚀 PRODUCCIÓN DESPLEGADA!
      
      El sitio principal ha sido actualizado.
      🔗 Ver cambios: ${{ steps.deployment.outputs.page_url }}

- name: Notify Development Branch Deploy
  if: success() && github.ref != 'refs/heads/main'
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      🧪 Deploy de desarrollo
      
      Branch: ${{ github.ref_name }}
      Preview disponible en breve
```

---

## 📈 Métricas de Build

### Incluir tiempo de build y tamaño

```yaml
- name: Calculate Build Metrics
  id: metrics
  run: |
    BUILD_TIME=${{ steps.build.outputs.time }}
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "build_time=$BUILD_TIME" >> $GITHUB_OUTPUT
    echo "dist_size=$DIST_SIZE" >> $GITHUB_OUTPUT

- name: Send Metrics to Telegram
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      📊 Métricas del Build
      
      ⏱️ Tiempo: ${{ steps.metrics.outputs.build_time }}
      📦 Tamaño: ${{ steps.metrics.outputs.dist_size }}
      🎯 Optimización: OK
```

---

## 🖼️ Enviar Screenshots

Si generas screenshots durante el build:

```yaml
- name: Take Screenshot
  run: |
    # Tu código para generar screenshot
    npm run screenshot

- name: Send Screenshot to Telegram
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: "🎮 Preview del juego actualizado"
    photo: ./screenshots/game-preview.png
```

---

## 📋 Lista de Cambios (Changelog)

### Enviar los últimos commits

```yaml
- name: Get Recent Commits
  id: commits
  run: |
    COMMITS=$(git log --oneline -5 | sed 's/^/• /')
    echo "commits<<EOF" >> $GITHUB_OUTPUT
    echo "$COMMITS" >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT

- name: Send Changelog to Telegram
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      📝 Cambios Recientes
      
      ${{ steps.commits.outputs.commits }}
      
      🔗 Ver todos: ${{ github.event.repository.html_url }}/commits
```

---

## 🎯 Notificaciones Específicas por Archivo

### Solo notificar si ciertos archivos cambiaron

```yaml
- name: Check Changed Files
  id: changed
  uses: tj-actions/changed-files@v40
  with:
    files: |
      src/**
      public/**

- name: Notify if Game Files Changed
  if: steps.changed.outputs.any_changed == 'true'
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      🎮 Archivos del juego actualizados!
      
      Archivos modificados:
      ${{ steps.changed.outputs.all_changed_files }}
```

---

## 👥 Múltiples Destinatarios

### Enviar a diferentes grupos según el evento

```yaml
# Notificar al equipo de desarrollo
- name: Notify Dev Team
  if: github.ref != 'refs/heads/main'
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_DEV_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: "🧪 Deploy de desarrollo completado"

# Notificar al equipo de producción
- name: Notify Prod Team
  if: github.ref == 'refs/heads/main'
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_PROD_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: "🚀 Deploy de producción completado"
```

---

## 🔔 Notificaciones Programadas

### Resumen diario del estado del proyecto

```yaml
name: Daily Status Report

on:
  schedule:
    - cron: '0 9 * * *'  # Cada día a las 9:00 AM UTC

jobs:
  daily-report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate Report
        id: report
        run: |
          COMMITS_TODAY=$(git log --since="24 hours ago" --oneline | wc -l)
          echo "commits=$COMMITS_TODAY" >> $GITHUB_OUTPUT

      - name: Send Daily Report
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            📅 Reporte Diario - Orden of Lords
            
            📊 Estadísticas de las últimas 24h:
            • Commits: ${{ steps.report.outputs.commits }}
            • Estado: ✅ Operacional
            • Último deploy: Ver GitHub Actions
            
            🔗 Repositorio: ${{ github.server_url }}/${{ github.repository }}
```

---

## 🎨 Formato Markdown en Telegram

Telegram soporta formato Markdown:

```yaml
- name: Send Formatted Message
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    format: markdown
    message: |
      *🎮 ORDEN OF LORDS*
      
      ✅ Deployment *exitoso*
      
      `Branch:` main
      `Commit:` ${{ github.sha }}
      
      [Ver Sitio](${{ steps.deployment.outputs.page_url }})
      [Ver Código](${{ github.event.repository.html_url }})
```

---

## 🔄 Integración con Pull Requests

### Notificar cuando se crea o fusiona un PR

```yaml
name: PR Notifications

on:
  pull_request:
    types: [opened, closed]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: PR Opened
        if: github.event.action == 'opened'
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            🔀 Nuevo Pull Request
            
            👤 Por: ${{ github.event.pull_request.user.login }}
            📝 Título: ${{ github.event.pull_request.title }}
            🔗 Ver: ${{ github.event.pull_request.html_url }}

      - name: PR Merged
        if: github.event.pull_request.merged == true
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            ✅ Pull Request Fusionado
            
            📝 ${{ github.event.pull_request.title }}
            🎉 Código integrado a ${{ github.event.pull_request.base.ref }}
```

---

## 🐛 Notificaciones de Issues

```yaml
name: Issue Notifications

on:
  issues:
    types: [opened, closed]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Issue Opened
        if: github.event.action == 'opened'
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            🐛 Nuevo Issue Reportado
            
            👤 Por: ${{ github.event.issue.user.login }}
            📝 Título: ${{ github.event.issue.title }}
            🔗 Ver: ${{ github.event.issue.html_url }}
```

---

## 🔐 Seguridad y Mejores Prácticas

### 1. Usar diferentes bots para diferentes entornos

```bash
# Desarrollo
TELEGRAM_DEV_BOT_TOKEN
TELEGRAM_DEV_CHAT_ID

# Producción
TELEGRAM_PROD_BOT_TOKEN
TELEGRAM_PROD_CHAT_ID
```

### 2. Limitar información sensible

```yaml
# ❌ NO hacer esto:
message: "Token: ${{ secrets.SOME_SECRET }}"

# ✅ Hacer esto:
message: "Deployment exitoso sin exponer secrets"
```

### 3. Rate limiting

```yaml
# Evitar spam agregando delays
- name: Wait before notification
  run: sleep 5

- name: Send notification
  uses: appleboy/telegram-action@master
```

---

## 📱 Botones Interactivos (Inline Keyboards)

Telegram también soporta botones:

```yaml
- name: Send with Buttons
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: "🎮 Nuevo deploy disponible!"
    keyboard: |
      [
        [
          {"text": "Ver Sitio", "url": "${{ steps.deployment.outputs.page_url }}"},
          {"text": "Ver Código", "url": "${{ github.event.repository.html_url }}"}
        ],
        [
          {"text": "Ver Actions", "url": "${{ github.event.repository.html_url }}/actions"}
        ]
      ]
```

---

## 🎯 Caso de Uso Completo

Ejemplo de workflow completo con todas las características:

```yaml
name: Complete Deployment with Telegram

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Calculate Metrics
        id: metrics
        run: |
          echo "size=$(du -sh dist | cut -f1)" >> $GITHUB_OUTPUT
          echo "files=$(find dist -type f | wc -l)" >> $GITHUB_OUTPUT

      - name: Deploy
        id: deploy
        run: |
          # Tu lógica de deployment
          echo "url=https://example.com" >> $GITHUB_OUTPUT

      - name: Send Success Notification
        if: success()
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          format: markdown
          message: |
            ✅ *Deployment Exitoso*
            
            🎮 *Proyecto:* Orden of Lords
            🌿 *Branch:* ${{ github.ref_name }}
            👤 *Por:* ${{ github.actor }}
            
            📊 *Métricas:*
            • Tamaño: ${{ steps.metrics.outputs.size }}
            • Archivos: ${{ steps.metrics.outputs.files }}
            
            🔗 [Ver Sitio](${{ steps.deploy.outputs.url }})
            🔗 [Ver Cambios](${{ github.event.repository.html_url }}/commit/${{ github.sha }})

      - name: Send Error Notification
        if: failure()
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_CHAT_ID }}
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          message: |
            ❌ Deployment Falló
            
            Branch: ${{ github.ref_name }}
            Por: ${{ github.actor }}
            
            Revisa los logs: ${{ github.event.repository.html_url }}/actions/runs/${{ github.run_id }}
```

---

## 💡 Tips Finales

1. **Prueba en desarrollo primero**: Usa un grupo de Telegram de prueba
2. **No spamees**: Usa condiciones para evitar notificaciones innecesarias
3. **Mantén los mensajes concisos**: Telegram tiene límites de caracteres
4. **Usa emojis con moderación**: Mejoran la legibilidad pero no abuses
5. **Documenta tus secrets**: Mantén un registro de qué secrets necesitas

---

¡Experimenta con estos ejemplos y personalízalos para tu proyecto! 🚀
