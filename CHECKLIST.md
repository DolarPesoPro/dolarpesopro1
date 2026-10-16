# Checklist · estado

**Hecho en código**
- Rutas por defecto denegadas; `config`/`history` solo se leen si el servicio está abierto (reglas con hora del servidor); `status` público solo con datos mínimos.
- `alerts`/`notifyOpen`: solo crear (no pisar ni leer), claves con formato válido, campos y valores validados.
- `stats.started`: solo +1 y con tope. (No se puede frenar un bot con reglas solas: ver pendiente 1.)
- Panel: confirmación al apagar, mensajes de éxito/error, estado único `status`.
- Calculadora: tope de importe, sin cotización falsa (estado de carga/error), fecha de actualización, formato argentino.
- Estados: cargando, sin conexión, conexión perdida, sin cotización, cerrado.
- Avisos ntfy: sin teléfono y con límite de 1 por minuto por dispositivo.
- Accesibilidad: foco visible, `prefers-reduced-motion`, campos a 16 px, etiquetas en campos, estados con texto.
- Open Graph y descripción; semántica `header/nav/main/footer`.
- `tests/rules.test.js`: 7 pruebas para el emulador.

**Pendiente (requiere algo de tu parte)**
1. Anti-spam real (alertas, contador): Firebase App Check + reCAPTCHA.
2. Admin por UID en vez de correo: copia tu UID de Authentication y reemplaza el correo en las reglas.
3. `og:image` debe ser una URL absoluta (https://tu-sitio/assets/logo.jpg).
4. Ejecutar las pruebas con el emulador (necesita Node + Java en tu PC).
5. Probar en Safari/Chrome/Firefox y a 320/375/390/430 px, y con horarios reales (medianoche incluida).
6. Revisar el historial de Git por secretos; rotar el tema ntfy.
7. Reversión: crea una etiqueta/release de Git antes de cada subida.
