# Dólar PesoPro · Calculadora en tiempo real

Sitio estático (HTML + CSS + JS) que se publica gratis en **GitHub Pages**.
Las cotizaciones, comisiones, avisos y la clave de administrador viven en un servidor (**Firebase**, plan gratuito),
no en los celulares de los clientes. Cuando cambias algo en el panel, todos los que tienen la página abierta lo ven al instante.

## Qué hay en la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `style.css`, `app.js` | La página |
| `firebase-config.js` | **El único archivo que debes editar** (tus datos de Firebase) |
| `firebase.rules.json` | Reglas de seguridad (se pegan una vez en Firebase) |
| `manifest.webmanifest`, `assets/` | Íconos, logo, mascotas, QR |

## Paso 1 · Crear el proyecto en Firebase (≈10 min)

1. Entra a <https://console.firebase.google.com> con tu cuenta de Google → **Agregar proyecto** → nombre `dolarpesopro` (puedes desactivar Google Analytics).
2. Menú **Compilación → Realtime Database → Crear base de datos**. Elige la región más cercana (Estados Unidos está bien) y **modo bloqueado**.
3. Pestaña **Reglas** de esa misma pantalla: borra todo, pega el contenido de `firebase.rules.json` y pulsa **Publicar**.
4. Menú **Compilación → Authentication → Comenzar → Correo electrónico/contraseña → Habilitar** (solo el primer interruptor) → Guardar.
5. En Authentication → pestaña **Users → Agregar usuario**:
   - Correo: `admin@dolarpesopro.app`
   - Contraseña: `pro123`  ← **esa es tu clave del panel**
6. Engranaje ⚙ **Configuración del proyecto → General → Tus apps → icono `</>` (Web)** → registra la app (sin Hosting). Te mostrará un bloque `firebaseConfig`. Copia sus valores en `firebase-config.js`
   (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`). Si no aparece `databaseURL`, está arriba en la pantalla de Realtime Database (`https://…firebaseio.com`).

## Paso 2 · Subir a GitHub

1. Crea una cuenta en <https://github.com> y un repositorio **público** nuevo, por ejemplo `dolarpesopro`.
2. **Add file → Upload files** y arrastra **el contenido** de esta carpeta (incluida la carpeta `assets`) → **Commit changes**.
3. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En 1–2 minutos tu página queda en `https://TU_USUARIO.github.io/dolarpesopro/`. Ese es el link para tus clientes.

## Paso 3 · Autorizar el dominio en Firebase

Firebase → **Authentication → Configuración → Dominios autorizados → Agregar dominio** → `TU_USUARIO.github.io`.
(Sin esto, el login del administrador falla.)

## Cómo entrar al panel de administrador

- Toca el pequeño candado 🔒 al final de la página, o abre `https://TU_USUARIO.github.io/dolarpesopro/#admin`.
- Aparece solo un campo **Clave**. Al escribir `pro123` se despliega el panel. Al recargar la página se vuelve a pedir (no se guarda en el dispositivo).
- Los clientes nunca ven el panel ni sus opciones.

### Qué puedes cambiar (todo en vivo)
1. Cotización oficial (botones −10, −5, +5, +10) → *Publicar*. Muestra "Confirmado en el servidor".
2. Permitir o bloquear que el cliente cambie la cotización.
3. Comisiones (fija, umbral, porcentaje) y monto mínimo para calcular.
4. Aviso para clientes (banner arriba).
5. Horario de atención (indicador "Atendiendo ahora").
6. Lista de clientes que pidieron aviso de cotización, con botón de WhatsApp.
7. Cambiar la clave (mínimo 6 caracteres: Firebase no admite menos).

## Probar que se actualiza en tiempo real
Abre la página en dos celulares (o PC + celular). Entra al panel en uno, cambia la comisión o la cotización y pulsa guardar:
el otro se actualiza solo, sin recargar. El punto verde **EN VIVO** junto a la cotización confirma la conexión.

## Seguridad: léelo
- Lo que protege los datos son las **reglas** (paso 1.3): solo el usuario `admin@dolarpesopro.app` puede escribir cotización/comisiones. Cualquiera puede leer la cotización (es pública).
- `pro123` es fácil, por eso también es **fácil de adivinar**. Funciona, pero cámbiala por una más larga desde el panel (punto 7) cuando puedas.
- Si prefieres otro correo interno, cámbialo en **tres** lugares: `firebase-config.js`, `firebase.rules.json` y el usuario creado en Firebase.
- Los números de WhatsApp de quienes piden avisos se guardan en Firebase (no en sus teléfonos) y solo los lee el administrador.

## Si algo falla
- Punto gris "SIN CONEXIÓN" o "DEMOSTRACIÓN": revisa `firebase-config.js`.
- "Clave incorrecta": verifica que el usuario exista en Authentication y la contraseña sea la misma.
- "Sin permiso": las reglas no están publicadas o el correo no coincide.
- Para probar en tu PC sin subir: en la carpeta, `python3 -m http.server 8000` y abre `http://localhost:8000` (agrega `localhost` a dominios autorizados).
