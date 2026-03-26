# Laboratorio: autenticacion con Better Auth, Vite, React y TypeScript

Este proyecto contiene un laboratorio listo para estudiar y ejecutar por tu cuenta. Incluye:

- Frontend en `Vite + React + TS`
- Backend en `Express + Better Auth`
- Persistencia con `SQLite`
- Sesiones basadas en cookies
- Registro, login, cierre de sesion y ruta protegida

## Arquitectura del ejemplo

```text
client (http://localhost:5173)
  -> formularios y UI
  -> authClient de Better Auth
  -> fetch con credentials: "include"

server (http://localhost:3000)
  -> Better Auth montado en /api/auth/*
  -> SQLite para usuarios y sesiones
  -> CORS con credentials habilitado
  -> ruta protegida /api/private/report
```

## Que demuestra este laboratorio

1. Autenticacion no es solo comparar correo y contrasena.
2. La identidad debe mantenerse entre peticiones HTTP.
3. Better Auth encapsula la parte delicada de sesiones, cookies y endpoints.
4. El navegador envia la cookie automaticamente; el frontend no necesita leerla.
5. Si cliente y servidor viven en origenes distintos, CORS y credentials importan.

## Requisitos

- Node.js `22.5+`
- npm `10+`

Este ejemplo usa `node:sqlite`, disponible en Node moderno.

## Instalacion

1. Instala dependencias:

```bash
npm install
```

2. Crea archivos de entorno:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Genera las tablas de Better Auth:

```bash
npm run db:migrate
```

4. Opcional: crea un usuario demo:

```bash
npm run seed
```

Usuario demo sugerido:

- `demo@lab.local`
- `Demo12345`

5. Inicia frontend y backend:

```bash
npm run dev
```

## Recorrido recomendado

### Paso 1. Entender el problema real

Pregunta base:

> Cuando un usuario inicia sesion, como sabe el servidor que la siguiente peticion viene de la misma persona?

La idea es conectar esto con que HTTP es `stateless`.

### Paso 2. Separar autenticacion de autorizacion

- Autenticacion: quien eres
- Autorizacion: que puedes hacer

En el laboratorio:

- El login ocurre en Better Auth
- La autorizacion se observa en la ruta `GET /api/private/report`

### Paso 3. Explicar la sesion

Better Auth crea una sesion y la representa mediante cookies. En peticiones futuras, el navegador adjunta la cookie y el backend valida esa sesion.

### Paso 4. Revisar el backend

Archivos clave:

- `server/src/auth.ts`
- `server/src/server.ts`
- `server/src/db.ts`

Puntos importantes:

- `trustedOrigins` conecta Better Auth con el frontend permitido
- `toNodeHandler(auth)` monta los endpoints de autenticacion
- `auth.api.getSession(...)` permite proteger otras rutas del backend

### Paso 5. Revisar el frontend

Archivos clave:

- `client/src/lib/auth-client.ts`
- `client/src/pages/AuthPage.tsx`
- `client/src/pages/DashboardPage.tsx`
- `client/src/App.tsx`

Puntos importantes:

- `createAuthClient` apunta al backend de autenticacion
- `useSession()` vuelve reactiva la UI frente a login y logout
- `fetch(..., { credentials: "include" })` hace visible el rol del navegador en el envio de cookies

### Paso 6. Probar el flujo completo

1. Abrir `http://localhost:5173`
2. Crear una cuenta nueva o usar el usuario demo
3. Entrar al dashboard
4. Mostrar la respuesta JSON del recurso protegido
5. Abrir DevTools y revisar:
   - request a `/api/auth/sign-in/email`
   - request a `/api/private/report`
   - cookies del dominio `localhost:3000`
6. Cerrar sesion y repetir la llamada protegida

## Ideas clave para tener presentes

- "La cookie HttpOnly no elimina todos los riesgos, pero reduce la exposicion frente a XSS."
- "No basta con autenticar bien; el navegador tambien debe estar configurado para aceptar y reenviar credenciales."
- "Un framework de autenticacion no reemplaza el criterio de seguridad, pero lo operacionaliza."

## Reto opcional

Implementa una pagina de perfil donde el usuario pueda actualizar su nombre usando `authClient.updateUser(...)` y hacer que el `SessionBadge` muestre el nuevo nombre sin recargar manualmente la aplicacion.

### Pistas del reto

1. Crear una nueva ruta `/profile`
2. Mostrar el nombre actual desde `useSession()`
3. Enviar el nuevo nombre con `authClient.updateUser`
4. Refrescar la sesion con `refetch()`
5. Bloquear la ruta si no existe sesion

## Fuentes oficiales usadas para alinear el ejemplo

- [Better Auth Basic Usage](https://better-auth.com/docs/basic-usage)
- [Better Auth Installation](https://better-auth.com/docs/installation)
- [Better Auth SQLite Adapter](https://better-auth.com/docs/adapters/sqlite)
- [Better Auth Options](https://better-auth.com/docs/reference/options)
- [Better Auth Express Integration](https://beta.better-auth.com/docs/integrations/express)
