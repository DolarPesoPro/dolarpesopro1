# Dólar PesoPro · Calculadora en tiempo real

Sitio estático (HTML + CSS + JS) para **GitHub Pages**. Cotización, avisos, estado en línea y clave de administrador
viven en **Firebase** (plan gratuito): cuando cambias algo en el panel, todos lo ven al instante.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html`, `style.css`, `app.js` | La página |
| `firebase-config.js` | Tus datos de Firebase (+ opcional `NTFY_TOPIC` para avisos al celular) |
| `firebase.rules.json` | Reglas de seguridad (**cambiaron: pégalas de nuevo en Firebase → Realtime Database → Reglas → Publicar**, para el contador de operaciones) |
| `manifest.webmanifest`, `assets/` | Íconos, logo, mascotas, QR |

## Instalación (igual que antes)
1. Firebase: Realtime Database + reglas de `firebase.rules.json` + Authentication (correo/contraseña) con el usuario `admin@dolarpesopro.app`.
2. Copia tus valores en `firebase-config.js`.
3. Sube **todo el contenido** (con la carpeta `assets`) a un repositorio público de GitHub y activa Pages.
4. Firebase → Authentication → Dominios autorizados → agrega `TU_USUARIO.github.io`.

## Panel de administrador
Candado 🔒 al final de la página o `#admin`. Ahí tienes:
- **Botón de arranque (arriba):** un toque = EN LÍNEA (verde) / FUERA DE LÍNEA. Fuera de línea, los clientes ven una pantalla completa de "apagado" (animación de pantalla que se apaga + paisaje nocturno) y no pueden usar nada. Tú, con la sesión de administrador abierta, sigues viendo todo normal; el enlace "Ver pantalla de clientes" te muestra lo que ven ellos. Si la página está apagada y quieres entrar al panel, toca el candado pequeño de la esquina de la pantalla de apagado.
1. Cotización oficial (−10, −5, +5, +10) → Publicar. Si hay clientes esperando ese precio, te lo avisa.
- **Apagar pide confirmación** (encender no).
- **Contador del día** (solo tú): cambios iniciados (toques de clientes en *Hacer cambio*) y concretados (botón +1 que tocas tú).
2. Cotización pesos → dólares (opcional): si la escribes, los clientes la ven en la tarjeta y en la pestaña *Pesos → Dólares* con cálculo rápido.
3. Permitir o bloquear que el cliente modifique la cotización.
4. Monto mínimo para calcular. *(Las comisiones son fijas en el código.)*
5. Aviso para clientes.
6. Horario de atención: con horario activo, la pantalla de apagado muestra “Abrimos en 2 h 15 min”.
7. Clientes que pidieron aviso, con botón de WhatsApp.
8. Cambiar clave (mínimo 6 caracteres).

## Pantalla de apagado
El paisaje cambia solo según la hora de Argentina: 06–17 desierto, 17–20 atardecer, 20–24 ciudad nocturna, 00–06 noche estrellada. El logo y el emoji se adaptan. En el panel, *Ver pantalla de clientes* → *Cambiar escena* para previsualizar.

## Avisos al celular de Justo (opcional, gratis)
0. El tema ya está configurado en `firebase-config.js` (`pesopro-justo-im6zas834chdzq`).
1. Instala la app **ntfy** (Android/iPhone) en el teléfono de Justo.
2. Toca “+” y suscríbete exactamente a ese tema.
Cada vez que un cliente pida un aviso de cotización, a Justo le llega una notificación con un toque directo al WhatsApp del cliente.

## Botón "Hacer cambio"
Junto a "Copiar" (en el mensaje y en la barra inferior) hay un botón **Hacer cambio**: copia el mensaje y deja elegir con quién abrir el chat (Justo o Boris). El botón **Cómo funciona** (junto a "Calcula tu envío") abre la guía, los pasos y las preguntas.

## Horas
Todas las horas se muestran en formato 24 h (y el selector del panel también).

## Seguridad
- Lo que protege los datos son las reglas de Firebase. `pro123` es fácil de adivinar: cámbiala desde el panel (punto 7).
- El nombre del tema de ntfy es público en el código: usa uno largo y poco obvio.

## Si algo falla
- "SIN CONEXIÓN" / "DEMOSTRACIÓN": revisa `firebase-config.js`.
- "Clave incorrecta": el usuario debe existir en Authentication.
- "Sin permiso": reglas sin publicar o correo distinto.
- Probar en tu PC: `python3 -m http.server 8000` y abre `http://localhost:8000` (agrega `localhost` a dominios autorizados).
