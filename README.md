# Dólar PesoPro · Calculadora en tiempo real

Sitio estático (HTML + CSS + JS) para **GitHub Pages**. Cotización, avisos, estado en línea, reseñas y clave de
administrador viven en **Firebase** (plan gratuito): cuando cambias algo en el panel, todos lo ven al instante.

## Archivos
| Archivo | Para qué sirve |
|---|---|
| `index.html`, `style.css`, `app.js` | La página. **Se suben siempre los tres juntos.** |
| `firebase-config.js` | Tus datos de Firebase (+ `NTFY_TOPIC` para avisos al celular) |
| `firebase.rules.json` | Reglas de seguridad. **Cambiaron:** pégalas en Firebase → Realtime Database → Reglas → Publicar |
| `manifest.webmanifest`, `assets/` | Íconos, logo, mascotas, QR |

## Actualizar el sitio (importante)
1. Sube **todos** los archivos al repositorio (reemplazando los anteriores) y espera 1–2 minutos a que Pages publique.
2. Publica las reglas nuevas de `firebase.rules.json` en Firebase.
3. Entra al panel: arriba hay una caja que dice **“✔ Todo al día”** o te dice qué falta (archivos de versiones distintas o reglas sin publicar).
4. En el celular, si ves textos raros como `doChange` o íconos gigantes, es un archivo viejo guardado en caché: cierra el navegador (en WhatsApp, cierra la vista) y ábrelo de nuevo. Los archivos llevan `?v=` para evitarlo.

## Panel de administrador
Candado 🔒 al final de la página o `#admin`.
- **Botón de arranque:** un toque = EN LÍNEA / FUERA DE LÍNEA. Apagar pide confirmación.
- **Motivo al apagar (nuevo):** escribe o elige “Feriado”, “Volvemos a las 9:00”… Lo ven los clientes en la pantalla de apagado y en la etiqueta de arriba. Al tocar “Sí, apagar” se guarda lo que esté escrito.
- **Contador del día:** cambios iniciados y concretados (+1 / −1).
1. Cotización oficial → Publicar. Nuevo: **Enviar cotización por WhatsApp (al grupo)** abre WhatsApp con el mensaje listo.
2. Cotización pesos → dólares (opcional).
3. Permitir o bloquear que el cliente modifique la cotización.
4. Monto mínimo para calcular. *(Las comisiones son fijas en el código.)*
5. Aviso para clientes.
6. Horario de atención (cuenta regresiva “Abrimos en…”).
7. Avisos de cotización pedidos por clientes.
8. **Esperan que abramos (nuevo):** clientes que tocaron “Avísame cuando abran”. Al encender, te avisa cuántos hay; cada uno tiene botón **Avisar** (abre su WhatsApp) y **Listo**.
9. **Reseñas de clientes (nuevo):** nombre, ciudad (opcional), estrellas y opinión. Aparecen al instante en la página como tarjetas deslizables. Carga solo opiniones reales y con permiso del cliente.
10. Cambiar clave (mínimo 10 caracteres) con botón **Generar clave larga**.

## Pantalla de apagado
Paisaje según la hora de Argentina (06–17 desierto, 17–20 atardecer, 20–24 ciudad, 00–06 noche). Muestra el motivo, la hora,
la cuenta regresiva si hay horario, el botón **Avísame cuando abran** y a Justo y Boris durmiendo (tócalos).

## Mascotas
Al llegar a la sección “Justo y Boris” conversan solos (una vez por visita). También hablan al tocarlos.

## Modo oscuro
Los tonos de texto están al inicio de `style.css`, en `:root[data-theme=dark]` (`--ink`, `--muted`, `--accent`). Súbelos o bájalos a gusto.

## Avisos al celular de Justo (opcional, gratis)
Instala **ntfy** en el teléfono de Justo y suscríbete al tema de `firebase-config.js`. Llegan avisos cuando un cliente pide
una cotización o pide que le avisen al abrir, con un toque directo a su WhatsApp.

## Seguridad
- Lo que protege los datos son las reglas de Firebase. Cambia `pro123` por una clave larga (punto 10 del panel).
- En Firebase → Authentication → Configuración → Acciones del usuario, desactiva **“Permitir crear cuentas”** (nadie más necesita registrarse).
- Los avisos de cotización y de apertura los puede crear cualquiera (solo el administrador los lee). Si algún día ves spam, usa “Borrar”.
- El tema de ntfy es público en el código: usa uno largo y poco obvio.

## Si algo falla
- “SIN CONEXIÓN” / “DEMOSTRACIÓN”: revisa `firebase-config.js`.
- “Clave incorrecta”: el usuario debe existir en Authentication.
- “Sin permiso”: reglas sin publicar o correo distinto.
- Probar en tu PC: `python3 -m http.server 8000` y abre `http://localhost:8000` (agrega `localhost` a dominios autorizados).

## Novedades (apagado real + automático + resumen)
- **Apagado real:** al apagar, Firebase deja de entregar la cotización y el historial a cualquier cliente (las reglas lo bloquean en el servidor). Los dispositivos abiertos se bloquean al instante y borran lo que tenían en memoria.
- **Encendido automático:** interruptor “Encendido automático por horario” en el panel. Usa el horario del punto 6 (hora de Argentina). El botón grande pasa a modo manual cuando lo tocas.
- **Resumen semanal:** en el contador del día, botón “Resumen semanal” → Enviar por WhatsApp o Copiar.
- **Orden de actualización:** 1) sube los archivos, 2) publica `firebase.rules.json`, 3) entra al panel, guarda el horario y toca el botón de encendido una vez para crear el nodo `status`.
- **Avisos ntfy:** ya no incluyen el teléfono del cliente. Cambia `NTFY_TOPIC` por uno nuevo (el anterior ya estuvo público).

## Pie de página y estados
- **Pie:** secciones plegables (Contacto, Horarios, Sobre las cotizaciones) para no recargar la pantalla. El horario sale solo del que guardes en el panel y muestra si estás en línea ahora.
- **Estados:** *cargando* (con animación), *sin conexión* (nunca cargó: no se muestra ninguna cotización), *conexión perdida* (aviso de valor posible desactualizado), *cotización no publicada* (calculadora atenuada). El servicio cerrado sigue usando la pantalla de apagado.
- Las imágenes van dentro de la carpeta `assets/`.
