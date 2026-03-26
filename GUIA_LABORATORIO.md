# Guía de Laboratorio

## Autenticación con Better Auth en Vite + React + TypeScript

Esta guía está pensada para que puedas completar el laboratorio sin supervisión directa. No solo explica qué hacer, sino también por qué lo hacemos. La idea es que al terminar entiendas la lógica completa de una autenticación moderna basada en sesiones por cookie.

## Objetivo del laboratorio

Al finalizar este ejercicio serás capaz de:

1. Distinguir autenticación de autorización.
2. Explicar qué problema resuelve una sesión en una aplicación web.
3. Integrar Better Auth en un backend con Express.
4. Conectar un frontend en React con el sistema de autenticación.
5. Proteger rutas del backend para que solo respondan si existe una sesión válida.
6. Observar cómo el navegador mantiene la identidad del usuario entre peticiones.

## Resultado esperado

Al final tendrás una aplicación con:

- Registro de usuario
- Inicio de sesión
- Cierre de sesión
- Visualización de la sesión actual
- Consumo de una ruta protegida
- Persistencia de sesión usando cookies

---

## Parte 1. Fundamentos teóricos

### 1.1 ¿Qué problema estamos resolviendo?

Cuando un usuario entra a una aplicación y escribe su correo y contraseña, el sistema necesita responder dos preguntas:

- ¿Quién eres?
- ¿Qué puedes hacer aquí?

La primera corresponde a la autenticación.
La segunda corresponde a la autorización.

Esto es importante porque muchas veces se confunden ambos conceptos.

### 1.2 Autenticación vs autorización

#### Autenticación

La autenticación consiste en verificar la identidad del usuario.

Ejemplos:

- correo y contraseña
- Google login
- GitHub login
- passkeys

Pregunta que responde:

> ¿Quién eres?

#### Autorización

La autorización ocurre después de autenticar.

Aquí el sistema decide qué recursos puede usar el usuario.

Ejemplos:

- entrar al panel privado
- consultar datos personales
- editar un perfil
- acceder a una ruta protegida

Pregunta que responde:

> ¿Qué puedes hacer?

### 1.3 ¿Por qué necesitamos una sesión?

HTTP es un protocolo stateless. Eso significa que cada petición llega al servidor como si fuera independiente de la anterior.

En otras palabras:

- el servidor recibe una petición
- responde
- y no recuerda automáticamente al usuario en la siguiente petición

Entonces aparece la necesidad de una sesión.

#### Definición simple

Una sesión es el mecanismo que permite mantener continuidad entre varias peticiones HTTP, de modo que el servidor pueda reconocer que siguen perteneciendo al mismo usuario autenticado.

### 1.4 ¿Cómo se mantiene una sesión?

En este laboratorio trabajaremos con el enfoque más clásico y muy usado en aplicaciones web:

- el servidor valida credenciales
- crea una sesión
- devuelve una cookie
- el navegador guarda esa cookie
- el navegador la envía automáticamente en peticiones posteriores
- el servidor valida esa cookie y reconoce la sesión

### 1.5 ¿Por qué usar Better Auth?

Porque implementar autenticación manualmente no es solo hacer un formulario.

También implica:

- proteger contraseñas correctamente
- manejar sesiones
- invalidar sesiones al cerrar sesión
- configurar cookies con seguridad
- exponer endpoints consistentes
- integrar frontend y backend sin errores

Better Auth encapsula gran parte de ese trabajo y nos deja concentrarnos en entender el flujo y usarlo correctamente.

### 1.6 ¿Por qué no usar localStorage para todo?

Muchos tutoriales sencillos guardan tokens en `localStorage`, pero eso puede ser peligroso si existe una vulnerabilidad XSS.

Si un script malicioso logra ejecutarse en la página:

- puede leer `localStorage`
- puede robar el token
- puede suplantar la sesión

Con cookies `HttpOnly`, JavaScript del navegador no puede leer directamente ese valor.

Eso no elimina todos los riesgos, pero sí reduce bastante la exposición.

### 1.7 ¿Qué papel juega CORS?

En este proyecto:

- el frontend corre en `http://localhost:5173`
- el backend corre en `http://localhost:3000`

Aunque ambos sean `localhost`, el navegador los considera orígenes diferentes porque usan puertos distintos.

Por eso necesitamos:

- permitir el origen del frontend en el backend
- permitir credenciales
- asegurarnos de enviar `credentials: "include"` al hacer `fetch`

Si esto no se configura, la autenticación puede parecer correcta en el servidor, pero el navegador no guardará o no reenviará la cookie.

---

## Parte 2. Arquitectura del laboratorio

Antes de ejecutar nada, revisa mentalmente esta estructura:

```text
client/
  Aplicación React con formularios, navegación y consumo de la API

server/
  Backend Express con Better Auth y SQLite
```

### Flujo general del sistema

1. El usuario escribe sus datos en React.
2. React usa el cliente de Better Auth.
3. Better Auth envía la petición al backend.
4. El backend valida credenciales.
5. Si son correctas, crea la sesión.
6. El backend responde con una cookie.
7. El navegador guarda esa cookie.
8. Cuando se consulta una ruta privada, la cookie viaja automáticamente.
9. El backend valida la sesión y decide si responde o no.

---

## Parte 3. Preparación del entorno

### 3.1 Requisitos

Necesitas tener instalado:

- Node.js 22 o superior
- npm 10 o superior

### 3.2 Verificar tu entorno

En la terminal ejecuta:

```bash
node -v
npm -v
```

#### ¿Por qué hacemos esto?

Porque este proyecto usa `node:sqlite`, una funcionalidad moderna de Node. Si tu versión es antigua, el proyecto puede fallar aunque el código esté bien.

---

## Parte 4. Instalación del laboratorio

### 4.1 Entrar al proyecto

Asegúrate de estar dentro de la carpeta del proyecto:

```bash
cd Auth
```

### 4.2 Instalar dependencias

Ejecuta:

```bash
npm install
```

#### ¿Qué está pasando aquí?

Este comando descarga las librerías necesarias para:

- el frontend con React y Vite
- el backend con Express
- Better Auth
- TypeScript
- herramientas de compilación

Sin estas dependencias, el proyecto no puede ejecutarse.

### 4.3 Crear los archivos de entorno

Ejecuta:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

#### ¿Por qué existe un archivo `.env`?

Porque algunas configuraciones cambian entre proyectos o ambientes, por ejemplo:

- puerto del servidor
- URL del frontend
- URL del backend
- secreto de Better Auth
- ubicación de la base de datos

Esto permite separar la configuración del código.

### 4.4 Crear la base de datos y las tablas

Ejecuta:

```bash
npm run db:migrate
```

#### ¿Qué hace este paso?

Better Auth necesita tablas para guardar:

- usuarios
- sesiones
- cuentas
- verificaciones

La migración crea esas estructuras en SQLite.

#### ¿Por qué no basta con instalar la librería?

Porque la autenticación necesita persistencia. Si no existe una base de datos donde guardar usuarios y sesiones, el servidor no tendrá dónde recordar la identidad del usuario.

### 4.5 Crear el usuario demo

Ejecuta:

```bash
npm run seed
```

Esto crea una cuenta de ejemplo:

- correo: `demo@lab.local`
- contraseña: `Demo12345`

#### ¿Por qué es útil este paso?

Porque te permite probar el flujo completo inmediatamente, incluso antes de crear tu propio usuario.

---

## Parte 5. Ejecutar la aplicación

### 5.1 Levantar frontend y backend

Ejecuta:

```bash
npm run dev
```

Esto iniciará:

- backend en `http://localhost:3000`
- frontend en `http://localhost:5173`

### 5.2 Abrir la aplicación

Ve a:

[http://localhost:5173](http://localhost:5173)

#### ¿Por qué usamos dos servidores?

Porque queremos simular un escenario muy real:

- el frontend vive en un origen
- el backend vive en otro

Eso nos obliga a entender CORS, cookies y credenciales, que son parte esencial del problema real de autenticación web.

---

## Parte 6. Recorrido guiado por la interfaz

### 6.1 Pantalla de inicio

La página principal resume el flujo del laboratorio y te recuerda las ideas principales:

- HTTP no recuerda al usuario por sí solo
- la sesión mantiene continuidad
- el backend protege recursos

### 6.2 Página de autenticación

En la ruta `/auth` encontrarás dos formularios:

- Registro
- Login

#### ¿Qué debes hacer primero?

Puedes elegir cualquiera de estas dos opciones:

1. Usar la cuenta demo.
2. Crear una cuenta nueva.

### 6.3 Registro

Si eliges registrarte:

1. escribe nombre
2. escribe correo
3. escribe contraseña de al menos 8 caracteres
4. pulsa el botón de crear cuenta

#### ¿Qué ocurre internamente?

El cliente llama:

- `authClient.signUp.email(...)`

Después:

- Better Auth valida los datos
- crea el usuario
- crea una sesión
- responde con la cookie de sesión

### 6.4 Login

Si eliges iniciar sesión:

1. escribe correo
2. escribe contraseña
3. pulsa el botón de iniciar sesión

Internamente se llama:

- `authClient.signIn.email(...)`

Si las credenciales son correctas:

- se crea o actualiza la sesión
- el navegador recibe la cookie
- la UI detecta que ya existe una sesión activa

### 6.5 Dashboard

Después de autenticarte entrarás al dashboard.

Allí verás:

- datos del usuario actual
- ID de sesión
- fecha de expiración
- un recurso protegido consultado al backend

#### ¿Qué debes observar con atención?

El dashboard no solo muestra información del login. También prueba que el backend realmente reconoce tu sesión cuando consultas una ruta privada.

---

## Parte 7. Entender el código paso a paso

En esta sección no solo vas a leer archivos: vas a interpretar por qué existen.

### 7.1 Backend: configuración general

Archivo:

`server/src/auth.ts`

Aquí se crea la instancia principal de Better Auth.

Observa especialmente:

- `baseURL`
- `secret`
- `database`
- `trustedOrigins`
- `emailAndPassword`
- `session`

#### ¿Qué significa cada uno?

`baseURL`

- Es la URL base del servidor de autenticación.
- Better Auth la usa para construir correctamente sus endpoints.

`secret`

- Se usa para firmado y operaciones sensibles.
- Nunca debería ser trivial en producción.

`database`

- Indica dónde se guardarán usuarios y sesiones.

`trustedOrigins`

- Define qué frontend tiene permiso para interactuar con este backend.

`emailAndPassword`

- Activa el login clásico por correo y contraseña.

`session`

- Configura la duración y actualización de la sesión.

### 7.2 Backend: conexión a SQLite

Archivo:

`server/src/db.ts`

Este archivo abre la base de datos SQLite.

#### ¿Por qué usar SQLite en un laboratorio?

Porque:

- no necesita instalar un servidor aparte
- es simple
- funciona bien para demos y prácticas
- permite concentrarnos en autenticación sin agregar complejidad extra

### 7.3 Backend: servidor Express

Archivo:

`server/src/server.ts`

Aquí ocurren varias cosas importantes.

#### A. Configuración de CORS

Se habilita:

- `origin: env.frontendUrl`
- `credentials: true`

#### ¿Por qué?

Porque el navegador solo enviará y aceptará cookies entre orígenes distintos si el backend lo permite explícitamente.

#### B. Rutas de Better Auth

Se monta:

```ts
app.all("/api/auth/{*any}", toNodeHandler(auth));
```

#### ¿Qué significa?

Que Better Auth maneja todos los endpoints de autenticación bajo `/api/auth`.

Por ejemplo:

- registro
- login
- logout
- sesión actual

#### C. Ruta protegida

También existe:

```ts
GET /api/private/report
```

Esta ruta:

- revisa si hay sesión
- responde `401` si no existe
- responde `200` con información protegida si la sesión es válida

#### ¿Por qué es importante esta ruta?

Porque aquí vemos la diferencia entre:

- estar autenticado
- y tener acceso a un recurso privado

### 7.4 Frontend: cliente de autenticación

Archivo:

`client/src/lib/auth-client.ts`

Este archivo crea el cliente de Better Auth para React.

Aquí se define:

- la URL base del backend

#### ¿Por qué el frontend necesita este cliente?

Porque es la forma recomendada de comunicarse con Better Auth sin tener que construir manualmente cada endpoint.

### 7.5 Frontend: pantalla de autenticación

Archivo:

`client/src/pages/AuthPage.tsx`

Aquí se implementan:

- el formulario de registro
- el formulario de login
- mensajes de éxito y error

Observa las funciones:

- `handleSignUp`
- `handleSignIn`

#### ¿Qué idea debes llevarte?

La autenticación no se implementa “inventando rutas desde cero” en el frontend. En lugar de eso, el frontend consume la API tipada que Better Auth ya ofrece.

### 7.6 Frontend: sesión reactiva

Archivo:

`client/src/App.tsx`

Aquí se usa:

```ts
authClient.useSession()
```

#### ¿Qué hace este hook?

Permite que la interfaz se actualice automáticamente cuando:

- el usuario inicia sesión
- el usuario cierra sesión
- cambia el estado de la sesión

#### ¿Por qué es útil?

Porque evita tener que programar manualmente sincronización entre:

- formularios
- almacenamiento local
- peticiones de sesión
- componentes visibles

### 7.7 Frontend: ruta protegida y recurso privado

Archivo:

`client/src/pages/DashboardPage.tsx`

Aquí se hace `fetch` a:

```ts
/api/private/report
```

con:

```ts
credentials: "include"
```

#### ¿Por qué este detalle es tan importante?

Porque si no envías `credentials: "include"`:

- el navegador no reenviará la cookie
- el backend no verá la sesión
- la ruta protegida responderá como si no hubieras iniciado sesión

Este es uno de los aprendizajes más importantes del laboratorio.

---

## Parte 8. Prueba guiada del flujo completo

Sigue exactamente este orden.

### 8.1 Prueba 1: comprobar que el proyecto abre

Abre la app y verifica que puedes navegar entre:

- Inicio
- Auth
- Dashboard

Si aún no has iniciado sesión, el dashboard debe redirigirte a `/auth`.

#### ¿Qué demuestra esto?

Que existe una validación básica de acceso en el frontend.

### 8.2 Prueba 2: registrar un usuario nuevo

En `/auth`:

1. escribe nombre
2. escribe correo nuevo
3. escribe contraseña
4. envía el formulario

Resultado esperado:

- aparece mensaje de éxito
- navegas al dashboard
- ves tu sesión activa

### 8.3 Prueba 3: cerrar sesión

En el dashboard:

1. pulsa `Cerrar sesión`

Resultado esperado:

- desaparece la sesión activa
- si intentas volver al dashboard, deberías necesitar autenticarte de nuevo

### 8.4 Prueba 4: iniciar sesión con la cuenta creada

Vuelve a `/auth` y entra con tus credenciales.

Resultado esperado:

- regreso al dashboard
- acceso permitido a la ruta protegida

### 8.5 Prueba 5: observar el recurso protegido

En el dashboard verás un bloque con respuesta JSON del backend.

Debes revisar que incluya:

- mensaje de acceso permitido
- resumen de la sesión
- correo del usuario

#### ¿Qué demuestra esto?

Que el backend no solo confía en el estado visual del frontend. Realmente recibió la cookie, validó la sesión y autorizó el acceso.

---

## Parte 9. Inspección con DevTools

Esta parte es muy importante porque conecta la teoría con lo que realmente hace el navegador.

### 9.1 Abrir herramientas del navegador

Abre DevTools en tu navegador.

Ve a:

- pestaña `Network`
- pestaña `Application` o `Storage`, según el navegador

### 9.2 Observar el login

Haz login y busca la petición a:

```text
/api/auth/sign-in/email
```

Debes observar:

- status `200`
- cabecera `Set-Cookie`

#### ¿Qué significa esto?

Que el backend respondió ordenando al navegador guardar una cookie de sesión.

### 9.3 Observar la cookie

En almacenamiento del navegador, busca las cookies de `localhost`.

Debes notar que la sesión vive como cookie y no como un valor manual dentro del código de React.

### 9.4 Observar la ruta privada

Ahora busca la petición a:

```text
/api/private/report
```

#### ¿Qué debes concluir?

Si la petición respondió bien, entonces:

- el navegador envió la cookie
- el backend reconoció la sesión
- la autorización del recurso fue exitosa

---

## Parte 10. Errores comunes y cómo interpretarlos

### Error: no puedo iniciar el proyecto

Posibles causas:

- no ejecutaste `npm install`
- tu versión de Node es antigua
- faltan archivos `.env`

### Error: la ruta protegida responde 401 aunque hice login

Posibles causas:

- el backend no está corriendo
- faltó `credentials: "include"`
- CORS está mal configurado
- la cookie no fue guardada por el navegador

### Error: la base de datos no tiene tablas

Posible causa:

- no ejecutaste `npm run db:migrate`

### Error: no existe el usuario demo

Posible causa:

- no ejecutaste `npm run seed`

---

## Parte 11. Lo que deberías entender al terminar

Si completaste correctamente la guía, deberías poder explicar con tus propias palabras lo siguiente:

1. Por qué HTTP por sí solo no recuerda usuarios.
2. Qué es una sesión y para qué sirve.
3. Por qué Better Auth necesita base de datos en este ejemplo.
4. Qué papel cumplen las cookies en el mantenimiento de identidad.
5. Por qué el frontend no necesita leer manualmente la cookie para que la sesión funcione.
6. Por qué `credentials: "include"` es indispensable.
7. En qué se diferencian autenticación y autorización.

---

## Parte 12. Actividad final de comprobación

Antes de cerrar el laboratorio, responde estas preguntas en tu libreta o documento:

1. ¿Qué hace Better Auth después de validar correo y contraseña?
2. ¿Dónde se almacena la sesión en este laboratorio?
3. ¿Qué pasaría si quitamos `credentials: "include"` del `fetch`?
4. ¿Qué pasaría si el backend no permitiera el origen `http://localhost:5173`?
5. ¿Por qué decimos que el dashboard muestra un recurso autorizado y no solo un login exitoso?

---

## Parte 13. Reto opcional

Implementa una nueva página de perfil.

### Objetivo del reto

Permitir que el usuario autenticado cambie su nombre y que el nuevo nombre aparezca en la interfaz sin recargar manualmente la aplicación.

### Requisitos del reto

Debes:

1. crear una ruta `/profile`
2. mostrar el nombre actual del usuario
3. agregar un formulario para editar el nombre
4. usar `authClient.updateUser(...)`
5. refrescar la sesión después de actualizar
6. impedir acceso si no existe sesión

### ¿Por qué este reto tiene sentido?

Porque te obliga a practicar tres ideas importantes:

- trabajar con una sesión ya iniciada
- modificar información del usuario autenticado
- mantener sincronizada la interfaz con el estado real del backend

---

## Parte 14. Resumen final

En este laboratorio aprendiste que autenticar no es solo comparar credenciales.

También aprendiste que:

- la web necesita sesiones para mantener identidad
- las cookies permiten continuidad entre peticiones
- Better Auth facilita una implementación segura y consistente
- el navegador participa activamente en el flujo
- proteger rutas implica autorización, no solo login

Si entiendes este flujo, ya tienes una base sólida para trabajar autenticación en aplicaciones reales.
