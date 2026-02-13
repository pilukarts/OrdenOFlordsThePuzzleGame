# 📱 Configuración de Notificaciones de Telegram

Este documento explica cómo configurar las notificaciones de Telegram para GitHub Actions.

## 📋 Requisitos Previos

1. Una cuenta de Telegram
2. Acceso a un bot de Telegram (o crear uno nuevo)
3. Permisos de administrador en el repositorio de GitHub

---

## 🤖 Paso 1: Crear un Bot de Telegram

1. Abre Telegram y busca **@BotFather**
2. Inicia una conversación con `/start`
3. Crea un nuevo bot con el comando:
   ```
   /newbot
   ```
4. Sigue las instrucciones:
   - Elige un nombre para tu bot (ejemplo: "Orden of Lords Deployer")
   - Elige un username (debe terminar en 'bot', ejemplo: "ordenoflords_deploy_bot")
5. **Guarda el token** que te proporciona BotFather (se ve así: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

---

## 💬 Paso 2: Obtener tu Chat ID

### Opción A: Usando el bot GetIDs
1. Busca **@getidsbot** en Telegram
2. Inicia conversación con `/start`
3. Te enviará tu Chat ID

### Opción B: Usando tu propio bot
1. Envía un mensaje a tu bot recién creado
2. Visita esta URL en tu navegador (reemplaza `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Busca el campo `"chat":{"id":` en la respuesta JSON
4. Ese número es tu Chat ID

### Para grupos de Telegram:
1. Agrega tu bot al grupo
2. Envía un mensaje en el grupo
3. Usa el mismo método de la URL para obtener el Chat ID del grupo
4. Los Chat IDs de grupos comienzan con `-` (negativo)

---

## 🔐 Paso 3: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** > **Actions**
4. Click en **New repository secret**

### Agregar los dos secrets:

**Secret 1: TELEGRAM_BOT_TOKEN**
- Name: `TELEGRAM_BOT_TOKEN`
- Secret: Pega el token que te dio BotFather
- Click en **Add secret**

**Secret 2: TELEGRAM_CHAT_ID**
- Name: `TELEGRAM_CHAT_ID`
- Secret: Pega tu Chat ID (o el del grupo)
- Click en **Add secret**

---

## ⚡ Paso 4: Activar las Notificaciones

1. Abre el archivo `.github/workflows/deploy.yml`
2. Busca las líneas comentadas que empiezan con `#` en las secciones de Telegram
3. **Descomenta** las líneas (elimina el `#` al inicio de cada línea)

### Antes (comentado):
```yaml
# - name: Send Telegram Notification on Success
#   if: success()
#   uses: appleboy/telegram-action@master
```

### Después (activo):
```yaml
- name: Send Telegram Notification on Success
  if: success()
  uses: appleboy/telegram-action@master
```

4. Haz commit y push de los cambios
5. ¡Listo! Ahora recibirás notificaciones en Telegram

---

## 📨 Tipos de Notificaciones

### ✅ Notificación de Éxito
Se envía cuando el deployment es exitoso. Incluye:
- Nombre del proyecto
- Branch desplegado
- Usuario que hizo el push
- Mensaje del commit
- URL del sitio desplegado
- Timestamp

### ❌ Notificación de Error
Se envía cuando el deployment falla. Incluye:
- Nombre del proyecto
- Branch
- Usuario que hizo el push
- Mensaje del commit
- Enlace para revisar los logs

---

## 🎨 Personalizar los Mensajes

Puedes personalizar los mensajes en el archivo `deploy.yml` editando el campo `message`:

```yaml
message: |
  ✅ Tu mensaje personalizado aquí!
  
  Variables disponibles:
  - ${{ github.repository }}
  - ${{ github.ref_name }}
  - ${{ github.actor }}
  - ${{ github.event.head_commit.message }}
  - ${{ steps.deployment.outputs.page_url }}
```

### Emojis útiles para notificaciones:
- ✅ Éxito
- ❌ Error
- 🎮 Juego/Proyecto
- 🌿 Branch
- 👤 Usuario
- 📝 Commit
- 🔗 Link
- ⏰ Tiempo
- 🚀 Deployment
- 🔧 Build
- 📦 Release

---

## 🧪 Probar las Notificaciones

1. Asegúrate de que los secrets están configurados
2. Descomenta las secciones de Telegram en `deploy.yml`
3. Haz un pequeño cambio en el código (por ejemplo, en README.md)
4. Haz commit y push
5. Ve a **Actions** en GitHub para ver el progreso
6. Deberías recibir una notificación en Telegram cuando termine

---

## 🔍 Solución de Problemas

### No recibo notificaciones:
1. ✅ Verifica que los secrets están configurados correctamente
2. ✅ Asegúrate de haber iniciado conversación con tu bot
3. ✅ Verifica que las líneas están descomentadas en deploy.yml
4. ✅ Revisa los logs en GitHub Actions para ver errores

### El bot no responde:
1. Verifica que el token es correcto
2. Prueba el bot enviándole un mensaje directamente
3. Si usas un grupo, asegúrate de que el bot está agregado

### Error "Forbidden":
- Significa que no has iniciado conversación con el bot
- Envía `/start` a tu bot en Telegram

### Chat ID incorrecto:
- Verifica el número (debe ser solo números)
- Para grupos, debe empezar con `-`
- Asegúrate de no incluir espacios

---

## 📚 Recursos Adicionales

- [Documentación oficial de Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub Action de Telegram (appleboy)](https://github.com/appleboy/telegram-action)
- [BotFather](https://t.me/BotFather)

---

## 🔄 Workflow Completo

```
1. Push al repositorio
   ↓
2. GitHub Actions se activa
   ↓
3. Build del proyecto
   ↓
4. Deploy a GitHub Pages
   ↓
5. ✅ Notificación de éxito a Telegram
   o
   ❌ Notificación de error a Telegram
```

---

## 💡 Consejos Pro

1. **Usa grupos separados**: Crea un grupo específico para notificaciones de deployment
2. **Silencia notificaciones**: En Telegram, puedes silenciar el grupo pero aún ver las notificaciones
3. **Múltiples proyectos**: Puedes usar el mismo bot para varios proyectos, solo cambia el mensaje
4. **Filtrar por branch**: Agrega condiciones en el workflow para notificar solo ciertos branches

### Ejemplo de notificación solo para main:
```yaml
- name: Send Telegram Notification
  if: success() && github.ref == 'refs/heads/main'
  uses: appleboy/telegram-action@master
```

---

## 📱 Resultado Final

Una vez configurado, recibirás mensajes como estos:

**Éxito:**
```
✅ Deployment exitoso!

🎮 Proyecto: pilukarts/OrdenOFlordsThePuzzleGame
🌿 Branch: main
👤 Por: pilukarts
📝 Commit: Add new game feature
🔗 URL: https://pilukarts.github.io/OrdenOFlordsThePuzzleGame/

⏰ Tiempo: 2026-02-13T05:00:00Z
```

**Error:**
```
❌ Deployment falló!

🎮 Proyecto: pilukarts/OrdenOFlordsThePuzzleGame
🌿 Branch: main
👤 Por: pilukarts
📝 Commit: Fix bug

Por favor revisa los logs en GitHub Actions.
```

---

¡Listo! Ahora tienes notificaciones profesionales de Telegram para tu proyecto. 🎉
