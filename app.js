/* Dólar PesoPro · calculadora en tiempo real (Firebase Realtime Database)
   - Los datos viven en el servidor. En el dispositivo solo se recuerda el último monto y la dirección (dólares→pesos o al revés); nunca datos bancarios.
   - Sin Firebase configurado funciona en modo demostración con valores por defecto. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Versión de los archivos: index.html, style.css y app.js deben coincidir. Si el celular guardó uno viejo, se recarga una vez y el panel avisa. */
  var VER = '20261020h';
  var VERBAD = (function () {
    var m = document.querySelector('meta[name=pp-version]'), hv = m ? m.getAttribute('content') : '', cv = '', bad = [];
    try { cv = getComputedStyle(document.documentElement).getPropertyValue('--v').replace(/["'\s]/g, ''); } catch (e) {}
    if (hv !== VER) bad.push('index.html (' + (hv || 'viejo') + ')');
    if (cv !== VER) bad.push('style.css (' + (cv || 'viejo') + ')');
    return bad;
  })();
  if (VERBAD.length && !/[?&]r=/.test(location.search)) { try { location.replace(location.pathname + (location.search ? location.search + '&' : '?') + 'r=' + Date.now() + location.hash); } catch (e) {} }

  var PHONES = { justo: '5492216960939', boris: '5492216976823' };
  var DEFAULTS = { rate: 1580, prev: 0, updatedAt: 0, allowManual: true, feeFixed: 1.5, feeThreshold: 60, feePct: 2.5,
    minUsd: 3, rateSell: 0, online: true, announcement: '', hoursOn: false, hoursFrom: '09:00', hoursTo: '22:00', offReason: '' };

  /* ---------- textos ---------- */
  var I18N = {
    es: {
      fContact: 'Contacto', fHours: 'Horarios', fRates: 'Sobre las cotizaciones', fWaJusto: 'Escribir a Justo (WhatsApp)', fWaBoris: 'Escribir a Boris (WhatsApp)', fGroup: 'Grupo de WhatsApp', fIg: 'Instagram @dolarpesopro_', fTop: 'Volver arriba',
      fHoursOn: 'Todos los días de {a} a {b} (hora de Argentina).', fHoursOff: 'Sin horario fijo: atendemos cuando el indicador dice EN LÍNEA.', fShort: 'Valores de referencia. La operación se confirma con un administrador verificado.',
      sbLoadT: 'Buscando la cotización…', sbLoadM: 'Un momento, estamos trayendo el valor actualizado.',
      sbErrT: 'No pudimos conectar', sbErrM: 'Revisa tu internet e inténtalo de nuevo. Mientras tanto no mostramos ninguna cotización para evitar errores.',
      sbStaleT: 'Sin conexión', sbStaleM: 'Perdiste la conexión. El valor que ves puede estar desactualizado: confírmalo por WhatsApp antes de operar.',
      sbNoneT: 'Cotización no publicada', sbNoneM: 'Todavía no se cargó el valor de hoy. Escríbenos por WhatsApp y te lo confirmamos.', sbRetry: 'Reintentar',
      offChipR: 'Fuera de línea · {r}', revTitle: 'Lo que dicen nuestros clientes', revSub: 'Opiniones de personas que ya cambiaron con nosotros.', revHint: 'Desliza para ver más →',
      notifyBtn: 'Avísame cuando abran', notifyHelp: 'Escribe tu WhatsApp y te avisamos apenas estemos en línea.', nfSave: 'Guardar mi número',
      nfOk: '¡Listo! Te escribimos por WhatsApp apenas abramos.', nfBad: 'Revisa tu número: elige tu país y escríbelo sin el 0 inicial.', nfErr: 'No pudimos guardarlo. Intenta de nuevo en un momento.', nfPreview: 'Vista previa: aquí no se guarda nada.',
      loading: 'Cargando cotización…', tagline: 'CAMBIOS DE DIVISAS · ECUADOR A ARGENTINA', rateToday: 'DÓLAR HOY',
      offTitle: 'Fuera de línea', offSub: 'Por ahora no estamos atendiendo. Volvemos pronto: sigue el grupo de WhatsApp para enterarte.', offChip: 'Fuera de línea · volvemos pronto', onChip: 'Atendiendo ahora', liveClosed: 'FUERA DE LÍNEA', offHero: 'Volvemos pronto',
      doChange: 'Hacer cambio', pickTitle: '¿Con quién haces el cambio?', pickSub: 'Ya copiamos tu mensaje. Elige a quién escribirle: el chat se abre con tu monto y tus datos.',
      offH: 'Estamos descansando 🌙', offP: 'Dólar PesoPro está apagado por ahora. Volvemos pronto con la cotización al día. Entra al grupo para enterarte primero.', offClock: 'Hora en Argentina',
      offH_noche: 'Estamos descansando', offH_ciudad: 'La ciudad duerme, nosotros también', offH_atardecer: 'Cerramos por hoy', offH_desierto: 'Siesta bajo el sol',
      usdWantLbl: '…o los dólares que quieres recibir (USD)',
      opensIn: 'Abrimos en {x}', hoursInfo: 'Horario de atención · {a} – {b}',
      sellHero: 'Pesos → Dólares', sellLbl: 'Cotización de hoy (pesos por USD)', arsAmtLbl: 'Pesos que quieres cambiar (ARS)', arsLiveTxt: 'Recibirás ≈ {v}',
      arsPayTxt: 'Pagarás ≈ {v}',
      arsText2: 'Esta es la cotización de hoy. No se cobra comisión. Escríbele a un administrador para confirmar el precio antes de enviar.',
      alertPhoneHelp: 'Elige tu país y escribe tu número sin el 0 inicial.', instGuide: 'Ver paso a paso', gApp: 'Instalar app', footTag: 'Cambios de divisas entre Ecuador y Argentina, con administradores verificados.',
      ap_intro: 'Instala Dólar PesoPro gratis en la pantalla de inicio: se abre a pantalla completa, como una app, casi no ocupa espacio y siempre muestra la cotización al día.', mine: 'Tu dispositivo',
      ap_ios_t: 'iPhone o iPad (Safari)', ap_ios_1: 'Abre esta página en Safari.', ap_ios_2: 'Toca el botón Compartir: el cuadrado con una flecha hacia arriba, en la barra de abajo.', ap_ios_3: 'Desliza hacia abajo y toca “Agregar a inicio”.', ap_ios_4: 'Toca “Agregar”. Listo: el ícono de Dólar PesoPro queda en tu pantalla de inicio.', ap_ios_n: 'Si estás en otro navegador, copia el enlace y ábrelo en Safari para que aparezca esa opción.',
      ap_and_t: 'Android (Chrome)', ap_and_1: 'Abre esta página en Chrome.', ap_and_2: 'Toca el menú ⋮ (tres puntos), arriba a la derecha.', ap_and_3: 'Elige “Instalar app” o, si no aparece, “Añadir a la pantalla de inicio”.', ap_and_4: 'Confirma con “Instalar”. El ícono aparece junto a tus otras apps.', ap_and_n: 'En Samsung Internet: menú ☰ → “Añadir página a” → “Pantalla de inicio”. Si ves el botón “Instalar app” en la página, también puedes usarlo.',
      ap_pc_t: 'Computadora (Chrome o Edge)', ap_pc_1: 'Toca el ícono de instalar que aparece a la derecha de la barra de direcciones y confirma con “Instalar”.',
      calcTitle: 'Calcula tu envío', dirUsd: 'Dólares → Pesos', dirArs: 'Pesos → Dólares',
      amountLbl: 'Monto a enviar (USD)', rateLbl: 'Cotización (pesos por USD)', feeLbl: 'Comisión',
      feeIncl: 'Incluida en el monto', feeApart: 'Aparte del monto',
      enterAmount: 'Ingresa cuántos dólares quieres enviar para ver cuánto recibirás en pesos.',
      noFee: 'No se cobra comisión',
      arsText: 'Para cambiar de pesos a dólares, escríbele directamente a un administrador. La cotización se acuerda en el momento.',
      chatWa: 'Chatear por WhatsApp', guideTitle: 'Guía de uso', guideSub: 'Todo lo que necesitas saber para cambiar con Dólar PesoPro.',
      gHow: 'Cómo funciona', gQuick: 'Guía rápida', gFaq: 'Preguntas',
      speedTitle: 'Agiliza tu operación', speedSub: 'Datos opcionales: el mensaje de abajo se arma solo y lo copias con un toque.',
      rememberData: 'Recordar mis datos en este celular', rememberHelp: 'Se guardan solo en tu celular, no en nuestros servidores. Desmarca la casilla para borrarlos.',
      addData: 'Agregar mis datos (opcional)', holder: 'Nombre completo del titular', holderPh: 'Como figura en tu cuenta', bank: 'Banco o billetera virtual donde recibes',
      bankPh: 'Tu banco de preferencia o billetera virtual', alias: 'Alias, CBU o CVU', aliasPh: 'Tu alias o número de cuenta',
      aliasWarn: 'Por favor, asegúrate de que tu alias o CBU esté bien escrito antes de enviar el mensaje.',
      msgTitle: 'Mensaje listo para copiar', msgSub: 'Pégalo en el chat de Justo o Boris. Ya incluye tu monto y tus datos.',
      copy: 'Copiar mensaje', copied: 'Mensaje copiado',
      talkTitle: 'Habla con un administrador', talkSub: 'Abre el chat de WhatsApp con tu mensaje ya escrito. Solo administradores verificados.',
      chk1: 'Administradores verificados. Opera solo con Justo y Boris.', chk2: 'Directo a tu cuenta, en tu banco de preferencia o billetera virtual.', chk3: 'Precio congelado 10 minutos al confirmar.',
      alertTitle: 'Avísame cuando suba', alertSub: 'Dinos a qué cotización quieres cambiar y te escribimos por WhatsApp cuando llegue.',
      alertTarget: 'Cotización objetivo (pesos por USD)', alertPhone: 'Tu WhatsApp', alertBtn: 'Avisarme',
      cardBtn: '📸 Tarjeta de la cotización', cardBtnS: '📸 Tarjeta', cardTitle: 'Cotización del día', cardShare: 'Compartir', cardDl: 'Descargar', cardX: 'Cerrar', cardWait: 'Espera a que cargue la cotización', cardErr: 'No se pudo crear la imagen. Intenta de nuevo.', cardText: 'Cotización de hoy: {r} por dólar. Calcula tu cambio:', cardLbl: 'COTIZACIÓN DEL DÍA', cardPer: 'pesos por cada dólar', cardUpd: 'Actualizado {d} · hora de Argentina', cardAdm: 'Administradores verificados', cardFoot: 'Valor de referencia: se confirma con un administrador', cardFind: 'Búscanos en Instagram y WhatsApp', alertPriv: 'Solo usaremos tu número para este aviso.', pushBtn: '🔔 Avisarme en este celular', pushOk: '¡Listo! Te avisaremos en este celular cuando suba el dólar.', pushDenied: 'Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador.', pushIos: 'En iPhone primero instala la app: Compartir → Agregar a inicio, y ábrela desde ahí.', pushErr: 'No se pudo activar el aviso. Intenta de nuevo.', alertOk: '¡Listo! Te avisaremos por WhatsApp.',
      alertBad: 'Revisa la cotización y tu número de WhatsApp.', alertErr: 'No se pudo guardar. Intenta de nuevo.',
      shareTitle: 'Comparte y únete', shareSub: 'Recomienda Dólar PesoPro y entra al grupo para ver las novedades.', shareBtn: 'Compartir con un amigo',
      shareText: 'Cambia dólares a pesos entre Ecuador y Argentina con Dólar PesoPro. Cotiza aquí:',
      group: 'Grupo de WhatsApp', groupSub: 'Escanea el QR o toca el botón para unirte.', join: 'Unirme al grupo', follow: 'Seguirnos en Instagram',
      instTitle: 'Ten la app en tu celular', instBtn: 'Instalar app',
      instAndroid: 'Toca el menú ⋮ de Chrome y elige “Instalar app” o “Añadir a pantalla de inicio”.',
      instIos: 'En Safari toca el botón Compartir y elige “Agregar a inicio”.',
      histTitle: 'Historial de cotización', histEmpty: 'Aquí aparecerán las últimas cotizaciones publicadas.',
      brandTag: 'NUESTRA MARCA', brandH: '¡Cambia mejor, ahorra más!',
      brandP: 'Dólar PesoPro conecta Ecuador y Argentina con cambios de divisas rápidos, claros y con administradores verificados.',
      brandAdm: 'tus administradores verificados', copyright: '© 2026 Dólar PesoPro. Todos los derechos reservados.',
      disclaimer: 'Dato importante: los valores que ves son una simulación de referencia, calculada con la cotización publicada, y pueden ir variando durante el día. Tu operación queda confirmada cuando un administrador verificado (Justo o Boris) te lo indica; en ese momento te congelamos el precio por 10 minutos. Antes de enviar dinero, revisa bien los datos de la cuenta. Este contenido es solo informativo y no es asesoramiento financiero.',
      wJusto: 'Justo 🤠', wBoris: 'Boris 😎',
      recv: 'Recibirás en Argentina', rAmt: 'Monto', rFee: 'Comisión', rPay: 'Total a pagar', rRate: 'Cotización',
      freeze: 'El precio se congela 10 minutos al confirmar con un administrador. Actúa rápido: pasado ese tiempo, el precio se actualiza.',
      stRecv: 'Recibirás', stHelp: 'Habla con un administrador',
      helpManual: 'Cotización oficial: {r}. Puedes ajustarla si necesitas calcular con otro valor.',
      helpFixed: 'Esta cotización está fijada por el administrador.', reset: 'Volver a la cotización oficial ({r})',
      modeIncl: 'Envías el monto exacto: la comisión ya está incluida en el cálculo.',
      modeApart: 'Recibes el monto completo en pesos: la comisión se suma al total a pagar.',
      feeFixedLbl: '{n} USD fijos', feePctLbl: '{n}%',
      liveOn: 'EN VIVO', liveOff: 'SIN CONEXIÓN', liveDemo: 'DEMOSTRACIÓN', upd: 'Pesos por cada dólar · Act. {d}', updNone: 'Pesos por cada dólar',
      open: 'Atendiendo ahora · {a}–{b}', closed: 'Fuera de horario · {a}–{b} (Argentina)',
      s1t: 'Cotiza', s1d: 'Ingresa el monto en dólares y mira al instante cuánto recibirás en pesos.',
      s2t: 'Copia tu mensaje', s2d: 'Completa tus datos (opcional) y toca “Hacer cambio”: copiamos tu mensaje y abrimos el chat con Justo o Boris.',
      s3t: 'Confirma', s3d: 'El administrador confirma el precio, lo congela 10 minutos y te indica a qué cuenta enviar.',
      s4t: 'Recibe', s4d: 'Envía tu transferencia, manda el comprobante y recibe tus pesos en tu banco de preferencia o billetera virtual.',
      q1t: 'Ten listo antes de escribir', q1d: 'Tu monto en USD y el cálculo de arriba.\nEl nombre completo del titular de la cuenta donde recibes.\nTu alias, CBU o CVU (revisa que esté bien escrito).\nEl comprobante de tu transferencia, cuando el administrador te indique a qué cuenta enviar.',
      q2t: 'Comisiones por transferencia', q2a: 'Menos de {t} USD', q2b: 'Desde {t} USD', q2n: 'Elige arriba si la comisión va incluida en el monto o aparte.',
      q3t: 'Pesos a dólares', q3d: 'No se cobra comisión. Escríbele a Justo o Boris y acuerden la cotización del momento.',
      q4t: 'Para operar más rápido', q4d: 'Completa “Agregar mis datos” y toca Hacer cambio.\nActúa dentro de los 10 minutos del precio congelado.\nEscribe solo a Justo o Boris.',
      f1q: '¿Cuánto cobran de comisión?', f1a: 'Para montos menores a {t} USD la comisión es de {f} USD fijos. Desde {t} USD es el {p}% del monto a enviar.',
      f2q: '¿Qué significa comisión incluida o aparte?', f2a: 'Incluida: la comisión se calcula dentro del monto que envías, así que pagas exactamente ese monto. Aparte: recibes el monto completo en pesos y la comisión se suma a lo que pagas.',
      f3q: '¿Cuánto dura el precio?', f3a: 'Al confirmar con un administrador, el precio queda congelado 10 minutos. Pasado ese tiempo se actualiza, por eso conviene actuar rápido.',
      f4q: '¿Cómo sé que es seguro?', f4a: 'Opera únicamente con los administradores verificados Justo y Boris, cuyos números están en esta página. No envíes dinero a ningún otro contacto.',
      f5q: '¿Dónde recibo mis pesos?', f5a: 'Directo en tu banco de preferencia o en tu billetera virtual, sin hacer filas.',
      f6q: '¿Y si quiero cambiar pesos a dólares?', f6a: 'No se cobra comisión. Escríbele a un administrador para acordar la cotización en el momento.'
    },
    en: {
      fContact: 'Contact', fHours: 'Hours', fRates: 'About the rates', fWaJusto: 'Message Justo (WhatsApp)', fWaBoris: 'Message Boris (WhatsApp)', fGroup: 'WhatsApp group', fIg: 'Instagram @dolarpesopro_', fTop: 'Back to top',
      fHoursOn: 'Every day from {a} to {b} (Argentina time).', fHoursOff: 'No fixed schedule: we are available when the indicator says ONLINE.', fShort: 'Reference values. Transfers are confirmed by a verified administrator.',
      sbLoadT: 'Fetching the rate…', sbLoadM: 'One moment, we are loading the latest value.',
      sbErrT: 'We could not connect', sbErrM: 'Check your internet and try again. Meanwhile no rate is shown, to avoid mistakes.',
      sbStaleT: 'You are offline', sbStaleM: 'The connection dropped. The value shown may be out of date: confirm it on WhatsApp before transferring.',
      sbNoneT: 'Rate not published yet', sbNoneM: 'Today\'s value has not been set. Message us on WhatsApp and we will confirm it.', sbRetry: 'Try again',
      loading: 'Loading rate…', tagline: 'CURRENCY EXCHANGE · ECUADOR TO ARGENTINA', rateToday: 'DOLLAR TODAY',
      offTitle: 'Offline', offSub: 'We are not available right now. Back soon: follow the WhatsApp group to stay in the loop.', offChip: 'Offline · back soon', onChip: 'Available now', liveClosed: 'OFFLINE', offHero: 'Back soon',
      doChange: 'Start exchange', pickTitle: 'Who do you exchange with?', pickSub: 'Your message is copied. Pick who to write to: the chat opens with your amount and details.',
      offH: 'We are resting', offP: 'Dólar PesoPro is switched off for now. We will be back soon with an up-to-date rate. Join the group to hear first.', offClock: 'Argentina time',
      offH_noche: 'We are resting', offH_ciudad: 'The city sleeps, and so do we', offH_atardecer: 'We are closed for today', offH_desierto: 'Siesta under the sun',
      usdWantLbl: '…or the dollars you want to receive (USD)',
      opensIn: 'We open in {x}', hoursInfo: 'Opening hours · {a} – {b}',
      sellHero: 'Pesos → Dollars', sellLbl: 'Today’s rate (pesos per USD)', arsAmtLbl: 'Pesos you want to exchange (ARS)', arsLiveTxt: 'You will receive ≈ {v}',
      arsPayTxt: 'You will pay ≈ {v}',
      arsText2: 'This is today’s rate. No fee is charged. Message an administrator to confirm the price before sending.',
      alertPhoneHelp: 'Pick your country and type your number without the leading 0.', instGuide: 'See step by step', gApp: 'Install app', footTag: 'Currency exchange between Ecuador and Argentina, with verified administrators.',
      ap_intro: 'Install Dólar PesoPro for free on your home screen: it opens full screen like an app, takes almost no space and always shows the latest rate.', mine: 'Your device',
      ap_ios_t: 'iPhone or iPad (Safari)', ap_ios_1: 'Open this page in Safari.', ap_ios_2: 'Tap the Share button: the square with an arrow pointing up, in the bottom bar.', ap_ios_3: 'Scroll down and tap “Add to Home Screen”.', ap_ios_4: 'Tap “Add”. Done: the Dólar PesoPro icon is on your home screen.', ap_ios_n: 'If you are in another browser, copy the link and open it in Safari so that option appears.',
      ap_and_t: 'Android (Chrome)', ap_and_1: 'Open this page in Chrome.', ap_and_2: 'Tap the ⋮ menu (three dots), top right.', ap_and_3: 'Choose “Install app” or, if it is not there, “Add to Home screen”.', ap_and_4: 'Confirm with “Install”. The icon appears next to your other apps.', ap_and_n: 'On Samsung Internet: menu ☰ → “Add page to” → “Home screen”. If you see an “Install app” button on the page, you can use it too.',
      ap_pc_t: 'Computer (Chrome or Edge)', ap_pc_1: 'Click the install icon at the right of the address bar and confirm with “Install”.',
      calcTitle: 'Calculate your transfer', dirUsd: 'Dollars → Pesos', dirArs: 'Pesos → Dollars',
      amountLbl: 'Amount to send (USD)', rateLbl: 'Rate (pesos per USD)', feeLbl: 'Fee',
      feeIncl: 'Included in amount', feeApart: 'On top of amount',
      enterAmount: 'Enter how many dollars you want to send to see how many pesos you will receive.',
      noFee: 'No fee charged',
      arsText: 'To exchange pesos for dollars, message an administrator directly. The rate is agreed on the spot.',
      chatWa: 'Chat on WhatsApp', guideTitle: 'How-to guide', guideSub: 'Everything you need to know to exchange with Dólar PesoPro.',
      gHow: 'How it works', gQuick: 'Quick guide', gFaq: 'FAQ',
      speedTitle: 'Speed up your transfer', speedSub: 'Optional details: the message below builds itself and you copy it with one tap.',
      holder: 'Account holder full name', holderPh: 'As shown on your account', bank: 'Bank or digital wallet where you receive',
      bankPh: 'Your preferred bank or digital wallet', alias: 'Alias, CBU or CVU', aliasPh: 'Your alias or account number',
      aliasWarn: 'Please make sure your alias or CBU is written correctly before sending the message.',
      msgTitle: 'Message ready to copy', msgSub: 'Paste it in the chat with Justo or Boris. It already has your amount and details.',
      copy: 'Copy message', copied: 'Message copied',
      talkTitle: 'Talk to an administrator', talkSub: 'Opens a WhatsApp chat with your message already written. Verified administrators only.',
      chk1: 'Verified administrators. Only deal with Justo and Boris.', chk2: 'Straight to your account, in your preferred bank or digital wallet.', chk3: 'Price frozen for 10 minutes once confirmed.',
      alertTitle: 'Notify me when it rises', alertSub: 'Tell us the rate you want and we will message you on WhatsApp when it arrives.',
      alertTarget: 'Target rate (pesos per USD)', alertPhone: 'Your WhatsApp', alertBtn: 'Notify me',
      cardBtn: '📸 Rate card', cardBtnS: '📸 Card', cardTitle: 'Rate of the day', cardShare: 'Share', cardDl: 'Download', cardX: 'Close', cardWait: 'Wait for the rate to load', cardErr: 'Could not create the image. Please try again.', cardText: 'Today’s rate: {r} per dollar. Work out your exchange:', cardLbl: 'RATE OF THE DAY', cardPer: 'pesos per dollar', cardUpd: 'Updated {d} · Argentina time', cardAdm: 'Verified administrators', cardFoot: 'Reference value: confirmed by an administrator', cardFind: 'Find us on Instagram and WhatsApp', alertPriv: 'We will only use your number for this alert.', pushBtn: '🔔 Notify me on this phone', pushOk: 'Done! We will notify this phone when the dollar rises.', pushDenied: 'Notifications are blocked. Turn them on in your browser settings.', pushIos: 'On iPhone, install the app first: Share → Add to Home Screen, then open it from there.', pushErr: 'Could not enable alerts. Please try again.', alertOk: 'Done! We will notify you on WhatsApp.',
      alertBad: 'Check the rate and your WhatsApp number.', alertErr: 'Could not save. Please try again.',
      shareTitle: 'Share and join', shareSub: 'Recommend Dólar PesoPro and join the group for updates.', shareBtn: 'Share with a friend',
      shareText: 'Exchange dollars for pesos between Ecuador and Argentina with Dólar PesoPro. Check the rate here:',
      group: 'WhatsApp group', groupSub: 'Scan the QR or tap the button to join.', join: 'Join the group', follow: 'Follow us on Instagram',
      instTitle: 'Keep the app on your phone', instBtn: 'Install app',
      instAndroid: 'Tap the Chrome menu ⋮ and choose “Install app” or “Add to Home screen”.',
      instIos: 'In Safari tap the Share button and choose “Add to Home Screen”.',
      rememberData: 'Remember my details on this phone', rememberHelp: 'They are saved only on your phone, not on our servers. Untick the box to delete them.',
      addData: 'Add my details (optional)',
      offChipR: 'Offline · {r}', revTitle: 'What our customers say', revSub: 'Reviews from people who have already exchanged with us.', revHint: 'Swipe to see more →',
      notifyBtn: 'Notify me when you open', notifyHelp: 'Enter your WhatsApp and we will message you as soon as we are online.', nfSave: 'Save my number',
      nfOk: 'Done! We will message you on WhatsApp as soon as we open.', nfBad: 'Check your number: choose your country and enter it without the leading 0.', nfErr: 'We could not save it. Please try again in a moment.', nfPreview: 'Preview: nothing is saved here.',
      histTitle: 'Rate history', histEmpty: 'The latest published rates will appear here.',
      brandTag: 'OUR BRAND', brandH: 'Exchange better, save more!',
      brandP: 'Dólar PesoPro connects Ecuador and Argentina with fast, clear currency exchange and verified administrators.',
      brandAdm: 'your verified administrators', copyright: '© 2026 Dólar PesoPro. All rights reserved.',
      disclaimer: 'Important notice: the values shown are an indicative simulation calculated with the stated rate and may vary during the day. Your transfer is confirmed when a verified administrator (Justo or Boris) tells you so; at that moment we freeze the price for 10 minutes. Before sending money, double-check the account details. This content is for information only and is not financial advice.',
      wJusto: 'Justo 🤠', wBoris: 'Boris 😎',
      recv: 'You will receive in Argentina', rAmt: 'Amount', rFee: 'Fee', rPay: 'Total to pay', rRate: 'Rate',
      freeze: 'The price is frozen for 10 minutes once an administrator confirms. Act fast or it updates.',
      stRecv: 'You receive', stHelp: 'Talk to an administrator',
      helpManual: 'Official rate: {r}. You can adjust it if you need to calculate with another value.',
      helpFixed: 'This rate is set by the administrator.', reset: 'Back to the official rate ({r})',
      modeIncl: 'You send the exact amount: the fee is already included in the calculation.',
      modeApart: 'You receive the full amount in pesos: the fee is added to the total you pay.',
      feeFixedLbl: '{n} USD flat', feePctLbl: '{n}%',
      liveOn: 'LIVE', liveOff: 'OFFLINE', liveDemo: 'DEMO', upd: 'Pesos per dollar · Upd. {d}', updNone: 'Pesos per dollar',
      open: 'Available now · {a}–{b}', closed: 'Outside hours · {a}–{b} (Argentina)',
      s1t: 'Get a quote', s1d: 'Enter the amount in dollars and instantly see how many pesos you will receive.',
      s2t: 'Copy your message', s2d: 'Fill in your details (optional), copy the ready message or open a chat with Justo or Boris.',
      s3t: 'Confirm', s3d: 'The administrator confirms the price, freezes it for 10 minutes and tells you which account to send to.',
      s4t: 'Receive', s4d: 'Send your transfer, share the receipt and receive your pesos in your preferred bank or digital wallet.',
      q1t: 'Have ready before writing', q1d: 'Your amount in USD and the calculation above.\nThe full name of the holder of the account where you receive.\nYour alias, CBU or CVU (check it is written correctly).\nYour transfer receipt, once the administrator tells you which account to send to.',
      q2t: 'Transfer fees', q2a: 'Under {t} USD', q2b: 'From {t} USD', q2n: 'Choose above whether the fee is included in the amount or on top.',
      q3t: 'Pesos to dollars', q3d: 'No fee charged. Message Justo or Boris and agree on the rate of the moment.',
      q4t: 'To go faster', q4d: 'Fill in “Add my details” and tap Start exchange.\nAct within the 10 minutes of the frozen price.\nOnly write to Justo or Boris.',
      f1q: 'What fee do you charge?', f1a: 'For amounts under {t} USD the fee is {f} USD flat. From {t} USD it is {p}% of the amount to send.',
      f2q: 'What does fee included or on top mean?', f2a: 'Included: the fee is taken from the amount you send, so you pay exactly that amount. On top: you receive the full amount in pesos and the fee is added to what you pay.',
      f3q: 'How long does the price last?', f3a: 'Once an administrator confirms, the price is frozen for 10 minutes. After that it updates, so it pays to act fast.',
      f4q: 'How do I know it is safe?', f4a: 'Only deal with the verified administrators Justo and Boris, whose numbers are on this page. Do not send money to any other contact.',
      f5q: 'Where do I receive my pesos?', f5a: 'Straight in your preferred bank or digital wallet, no queues.',
      f6q: 'What if I want to exchange pesos for dollars?', f6a: 'No fee charged. Message an administrator to agree on the rate on the spot.'
    }
  };

  /* ---------- estado (solo en memoria) ---------- */
  var ua = navigator.userAgent || '';
  var OS = /Android/i.test(ua) ? 'android' : (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) ? 'ios' : 'desktop';
  document.documentElement.setAttribute('data-os', OS);

  var S = {
    lang: 'es', theme: 'light',
    cfg: Object.assign({}, DEFAULTS), historyRaw: [], online: false, live: false, firstCfg: true,
    amount: '100', mode: 'incluida', op: 'cambio', manual: null, dir: 'usd', gtab: 'como', faq: -1,
    holder: '', bank: '', alias: '', shown: 0, target: null, copied: false, admin: false, alerts: [], alSent: 0, arsAmount: '', usdWant: '', arsLast: 'ars', startedN: 0, stats: {}, reviews: [], waiters: [], nfSent: 0, rulesBad: {}, rvStars: 5
  };
  var reduce = false;   // las animaciones se ven siempre (en muchos celulares 'reducir movimiento' viene activado y las apagaba)
  var t = function (k, v) {
    var s = (I18N[S.lang] && I18N[S.lang][k]) || I18N.es[k] || k;
    if (v) Object.keys(v).forEach(function (x) { s = s.split('{' + x + '}').join(v[x]); });
    return s;
  };

  /* ---------- utilidades ---------- */
  function clean(v) { return String(v).replace(/[^0-9.,]/g, ''); }          // sin signo menos ni letras
  function num(v) {
    var s = String(v == null ? '' : v).trim().replace(/\s/g, '');
    if (!s) return 0;
    var c = s.lastIndexOf(','), d = s.lastIndexOf('.');
    if (c > -1 && d > -1) s = c > d ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (c > -1) s = s.split(',').length > 2 ? s.replace(/,/g, '') : s.replace(',', '.');
    else if (d > -1) { if (s.split('.').length > 2 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, ''); }
    var n = parseFloat(s);
    return isFinite(n) && n > 0 ? n : 0;
  }
  var fmt = function (n) { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var fmtN = function (n) { return n.toLocaleString('es-AR', { maximumFractionDigits: 2 }); };
  var usd = function (n) { return 'USD ' + fmt(n); };
  var ars = function (n) { return '$ ' + fmt(n); };
  var inN = function (n) { return String(n).replace('.', ','); };
  function whenTxt(ts) {
    var d = new Date(ts); if (isNaN(d.getTime())) return '';
    return d.toLocaleString(S.lang === 'en' ? 'en-GB' : 'es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  }
  function bindClean(el) {
    el.addEventListener('keydown', function (e) { if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault(); });
    el.addEventListener('input', function () { var c = clean(el.value); if (c !== el.value) el.value = c; });
  }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ---------- Firebase ---------- */
  var fbOk = typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && /^AIza/.test(window.FIREBASE_CONFIG.apiKey || '') && !/TU_/.test(window.FIREBASE_CONFIG.databaseURL || '');
  var db = null, auth = null;
  function numOr(v, d) { return typeof v === 'number' && isFinite(v) ? v : d; }
  function readCfg(v) {
    v = v || {};
    return {
      rate: numOr(v.rate, 0) > 0 ? v.rate : DEFAULTS.rate, hasRate: numOr(v.rate, 0) > 0, prev: numOr(v.prev, 0), updatedAt: numOr(v.updatedAt, 0),
      allowManual: v.allowManual !== false, feeFixed: Math.max(0, numOr(v.feeFixed, DEFAULTS.feeFixed)),
      feeThreshold: numOr(v.feeThreshold, 0) > 0 ? v.feeThreshold : DEFAULTS.feeThreshold, feePct: Math.max(0, numOr(v.feePct, DEFAULTS.feePct)),
      minUsd: Math.max(0, numOr(v.minUsd, DEFAULTS.minUsd)), rateSell: numOr(v.rateSell, 0) > 0 ? v.rateSell : 0, online: v.online !== false, announcement: typeof v.announcement === 'string' ? v.announcement : '',
      hoursOn: v.hoursOn === true, hoursFrom: typeof v.hoursFrom === 'string' ? v.hoursFrom : DEFAULTS.hoursFrom,
      hoursTo: typeof v.hoursTo === 'string' ? v.hoursTo : DEFAULTS.hoursTo,
      offReason: typeof v.offReason === 'string' ? v.offReason.slice(0, 120) : ''
    };
  }
  function histList() {
    var h = S.historyRaw;
    if (!Array.isArray(h)) h = h ? Object.keys(h).map(function (k) { return h[k]; }) : [];
    return h.filter(function (x) { return x && typeof x.rate === 'number'; }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }

  /* ojito para ver la clave */
  var EYE_SVG = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><line class="slash" x1="3" y1="3" x2="21" y2="21"/></svg>';
  function addEye(inp) {
    if (!inp || inp.dataset.eye) return; inp.dataset.eye = '1';
    var w = document.createElement('div'); w.className = 'pw'; inp.parentNode.insertBefore(w, inp); w.appendChild(inp);
    var b = document.createElement('button'); b.type = 'button'; b.className = 'eye'; b.innerHTML = EYE_SVG; b.setAttribute('aria-label', 'Mostrar clave'); b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { var show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; b.classList.toggle('on', show); b.setAttribute('aria-pressed', show ? 'true' : 'false'); b.setAttribute('aria-label', show ? 'Ocultar clave' : 'Mostrar clave'); inp.focus(); });
    w.appendChild(b);
  }
  function resetEye(inp) { if (!inp) return; inp.type = 'password'; var b = inp.parentNode && inp.parentNode.querySelector('.eye'); if (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); } }

  /* ---------- estado público: encendido / apagado / horario automático ---------- */
  var cfgRef = null, histRef = null;
  function srvNow() { return Date.now() + (S.offset || 0); }
  function srvMin() { var d = new Date(srvNow() - 10800000); return d.getUTCHours() * 60 + d.getUTCMinutes(); }   // hora de Argentina según el reloj del servidor
  function schedOpen(st) { var a = toMin(st.hoursFrom), b = toMin(st.hoursTo); if (a == null || b == null) return false; var n = srvMin(); return a <= b ? (n >= a && n < b) : (n >= a || n < b); }
  function applyStatus() {
    var st = S.status;
    if (!st || !st.mode) { S.master = true; S.auto = false; S.open = S.cfg.online !== false; return; }
    S.master = st.mode !== 'off'; S.auto = st.mode === 'auto';      // mode: on | off | auto (encendido + horario)
    S.open = S.master && (!S.auto || schedOpen(st));
    if (S.denied && !S.admin) S.open = false;
    S.cfg.online = S.open; S.cfg.offReason = typeof st.offReason === 'string' ? st.offReason.slice(0, 120) : '';
    if (st.hoursFrom && st.hoursTo) { S.cfg.hoursFrom = st.hoursFrom; S.cfg.hoursTo = st.hoursTo; }
    S.cfg.hoursRaw = S.cfg.hoursOn; if (S.auto) S.cfg.hoursOn = true;
  }
  function stFull(over) {
    var c = S.cfg, st = S.status || {}, o = Object.assign({ mode: curMode(), offReason: st.offReason || '', hoursFrom: c.hoursFrom, hoursTo: c.hoursTo }, over || {});
    o.auto = null;
    o.fromMin = toMin(o.hoursFrom) || 0; o.toMin = toMin(o.hoursTo) || 0; o.offReason = o.offReason || null; o.onlineAt = firebase.database.ServerValue.TIMESTAMP; return o;
  }
  function curMode() { return S.master === false ? 'off' : (S.auto ? 'auto' : 'on'); }
  function autoOn() { return !!(S.auto || (S.master === false && S.autoPref)); }       // interruptor "automático" (aunque el principal esté apagado)
  function modeFor(master, auto) { return master ? (auto ? 'auto' : 'on') : 'off'; }
  /* escritura mínima del estado: solo toca lo necesario (no pisa horarios con valores viejos) */
  function stMin(over) {
    var st = S.status || {}, o = Object.assign({ mode: curMode() }, over || {}); o.auto = null;
    o.onlineAt = firebase.database.ServerValue.TIMESTAMP;
    if (typeof st.fromMin !== 'number' || typeof st.toMin !== 'number') { var f = stFull(over); o.fromMin = f.fromMin; o.toMin = f.toMin; o.hoursFrom = f.hoursFrom; o.hoursTo = f.hoursTo; }
    return o;
  }
  function cfgCb(s) {
    var old = S.cfg.rate; S.cfg = readCfg(s.val()); S.autoPref = !!(s.val() && s.val().autoPref === true); S.denied = false; applyStatus();
    if (!S.firstCfg && old !== S.cfg.rate && S.open) { var h = $('#hero'); h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); liveToast(old); }
    S.firstCfg = false; S.live = true; update(); if (S.admin) refreshPanel(); maybeInitialToast();
  }
  function attachData() {
    if (!db || cfgRef) return;
    cfgRef = db.ref('config'); cfgRef.on('value', cfgCb, function () { cfgRef = null; S.denied = true; S.live = true; applyStatus(); update(); });
    histRef = db.ref('history'); histRef.on('value', function (s) { S.historyRaw = s.val() || []; update(); }, function () { histRef = null; });
  }
  function detachData() {   // apagado: se corta la lectura y se borra lo que el dispositivo tenía en memoria
    if (cfgRef) { cfgRef.off(); cfgRef = null; } if (histRef) { histRef.off(); histRef = null; }
    S.cfg = readCfg(null); S.historyRaw = []; S.firstCfg = true; applyStatus();
  }
  /* El módulo de inicio de sesión pesa mucho y solo lo usa el administrador: se descarga al tocar el candado, al abrir #admin o al iniciar sesión. */
  var authP = null;
  function authCb(u) { if (u && u.email === window.ADMIN_EMAIL) mountPanel(); else unmountPanel(); syncData(); }
  function loadAuth() {
    if (auth) return Promise.resolve(auth); if (authP) return authP;
    authP = new Promise(function (ok, no) {
      function go() { try { auth = firebase.auth(); auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function () {}); auth.onAuthStateChanged(authCb); ok(auth); } catch (e) { authP = null; no(e); } }
      if (!fbOk) { authP = null; var e0 = new Error('no-firebase'); e0.code = 'auth/network-request-failed'; return no(e0); }
      if (firebase.auth) return go();
      var x = document.createElement('script'); x.src = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js'; x.onload = go;
      x.onerror = function () { authP = null; var er = new Error('auth-load'); er.code = 'auth/network-request-failed'; no(er); }; document.head.appendChild(x);
    });
    return authP;
  }
  function syncData() { if (!db) return; if (S.admin || S.open) attachData(); else detachData(); }
  if (fbOk) {
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      db = firebase.database();
      db.ref('.info/connected').on('value', function (s) { S.online = !!s.val(); update(); });
      db.ref('.info/serverTimeOffset').on('value', function (s) { S.offset = s.val() || 0; applyStatus(); update(); });
      var stRefP = db.ref('status');
      function stCb(s) {
        var was = S.open; S.status = s.val(); applyStatus();
        S.themePub = (S.status && S.status.theme) || ''; S.themeFrom = (S.status && S.status.themeFrom) || ''; S.themeTo = (S.status && S.status.themeTo) || ''; try { localStorage.setItem('pp_theme', S.themePub); localStorage.setItem('pp_theme_win', JSON.stringify({ f: S.themeFrom, t: S.themeTo })); } catch (e) {} applySeason(); if (S.admin) renderThemes();
        if (S.open && was === false && !S.admin) S.live = false;     // reabre: espera la cotización real antes de mostrarla
        if (!S.open) S.live = true;
        syncData(); update(); if (S.admin) refreshPanel();
      }
      stRefP.on('value', stCb, function () {});
      S.resync = function () { try { db.goOnline(); } catch (e) {} stRefP.once('value', stCb).catch(function () {}); if (cfgRef) cfgRef.once('value', cfgCb).catch(function () {}); };
      db.ref('reviews').on('value', function (s) { S.reviews = revList(s.val()); S.rulesBad.reviews = false; renderReviews(); if (S.admin) { renderRvAdmin(); renderRules(); } }, function () { S.rulesBad.reviews = true; if (S.admin) renderRules(); });
      if (window.LAZY_AUTH === false || location.hash === '#admin') loadAuth().catch(function () {});
    } catch (e) { fbOk = false; db = null; auth = null; }
  }

  /* ---------- cálculo ---------- */
  function calc() {
    var c = S.cfg, mv = num(S.manual), useM = c.allowManual && S.manual !== null && mv > 0;
    var rate = useM ? mv : c.rate, amt = num(S.amount), incl = S.mode === 'incluida';
    var fee = amt < c.feeThreshold ? c.feeFixed : amt * c.feePct / 100;
    var feeLabel = amt < c.feeThreshold ? t('feeFixedLbl', { n: fmtN(c.feeFixed) }) : t('feePctLbl', { n: fmtN(c.feePct) });
    var net = incl ? amt - fee : amt, pay = incl ? amt : amt + fee;
    var ok = amt > 0 && amt >= c.minUsd && net > 0 && amt <= 10000000 && isFinite(amt * rate);
    return { rate: rate, official: c.rate, useM: useM, amt: amt, fee: fee, feeLabel: feeLabel, net: net, pay: pay, ok: ok, receive: ok ? net * rate : 0 };
  }
  function arsPair() {
    var r = S.cfg.rateSell; if (!(r > 0)) return { p: 0, u: 0 };
    if (S.arsLast === 'usd') { var u = num(S.usdWant); return { p: u * r, u: u }; }
    var p = num(S.arsAmount); return { p: p, u: p / r };
  }
  function message(k) {
    var OPN = { cambio: 'un cambio', transaccion: 'una transacción', giro: 'un giro' }, op = OPN[S.op] || OPN.cambio;
    var L = ['Hola, quiero hacer ' + op + ' con Dólar PesoPro.', ''];
    if (S.dir === 'ars') {
      var sc = S.cfg, pr = arsPair();
      if (sc.rateSell > 0 && pr.p > 0) L = ['Hola, quiero hacer ' + op + ' de pesos a dólares con Dólar PesoPro.', 'Cambio: ' + ars(pr.p), 'Cotización: ' + ars(sc.rateSell), 'Recibiré ≈ ' + usd(pr.u)];
      else L = ['Hola, quiero hacer ' + op + ' de pesos a dólares con Dólar PesoPro.', '¿Me indican la cotización del momento?'];
    } else if (k.ok) {
      L.push('Envío: ' + usd(k.amt) + ' (comisión ' + (S.mode === 'incluida' ? 'incluida' : 'aparte') + ')');
      L.push('Cotización: ' + ars(k.rate)); L.push('Recibiré: ' + ars(k.receive));
    } else L.push('Quiero cotizar ' + op + ' de dólares a pesos.');
    L.push('Titular: ' + (S.holder.trim() || '____'));
    L.push('Banco o billetera virtual: ' + (S.bank.trim() || '____'));
    L.push('Alias / CBU / CVU: ' + (S.alias.trim() || '____'));
    L.push(''); L.push('Quedo atento, gracias.');
    return L.join('\n');
  }

  /* ---------- horario ---------- */
  function arMinutes() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var h = 0, m = 0; p.forEach(function (x) { if (x.type === 'hour') h = +x.value % 24; if (x.type === 'minute') m = +x.value; });
      return h * 60 + m;
    } catch (e) { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  }
  function toMin(s) { var m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }

  /* ---------- pintado ---------- */
  function setText(id, v) { var n = $(id); if (n && n.textContent !== v) n.textContent = v; }
  function applyStatic() {
    document.documentElement.lang = S.lang;
    $$('[data-i18n]').forEach(function (n) { n.textContent = t(n.getAttribute('data-i18n')); });
    $$('[data-i18n-ph]').forEach(function (n) { n.setAttribute('placeholder', t(n.getAttribute('data-i18n-ph'))); });
    $$('[data-lang]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === S.lang); });
  }
  function chevSvg() { var ch = el('span', 'chev'); ch.innerHTML = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)"><path d="M6 9l6 6 6-6"/></svg>'; return ch; }
  function paintFaq() {
    $$('.faqlist').forEach(function (f) {
      Array.prototype.forEach.call(f.children, function (d, idx) { var o = S.faq === idx + 1; d.classList.toggle('open', o); d.querySelector('button').setAttribute('aria-expanded', o ? 'true' : 'false'); });
    });
  }
  function fillSteps(a) {
    a.textContent = '';
    [1, 2, 3, 4].forEach(function (i) {
      var s = el('div', 'step'), n = el('i', null, String(i)), b = el('div'), h = el('b', null, t('s' + i + 't')), d = el('div', 'sub', t('s' + i + 'd'));
      b.appendChild(h); b.appendChild(d); s.appendChild(n); s.appendChild(b); a.appendChild(s);
    });
  }
  function fillQuick(g) {
    var c = S.cfg; g.textContent = '';
    function box(title, lines) { var x = el('div', 'panelbox'); x.appendChild(el('b', null, title)); lines.forEach(function (l) { x.appendChild(el('p', null, l)); }); return x; }
    g.appendChild(box(t('q1t'), t('q1d').split('\n')));
    var fb = el('div', 'panelbox'); fb.appendChild(el('b', null, t('q2t')));
    [[t('q2a', { t: fmtN(c.feeThreshold) }), t('feeFixedLbl', { n: fmtN(c.feeFixed) })], [t('q2b', { t: fmtN(c.feeThreshold) }), t('feePctLbl', { n: fmtN(c.feePct) })]].forEach(function (r) {
      var row = el('div', 'frow'); row.appendChild(el('span', null, r[0])); row.appendChild(el('strong', null, r[1])); fb.appendChild(row);
    });
    fb.appendChild(el('p', null, t('q2n'))); g.appendChild(fb);
    g.appendChild(box(t('q3t'), [t('q3d')])); g.appendChild(box(t('q4t'), t('q4d').split('\n')));
  }
  function fillFaq(f) {
    var c = S.cfg; f.textContent = ''; f.classList.add('faqlist');
    for (var i = 1; i <= 6; i++) (function (i) {
      var w = el('div');
      var q = el('button', 'faqq'); q.type = 'button'; q.appendChild(el('span', null, t('f' + i + 'q'))); q.appendChild(chevSvg());
      var acc = el('div', 'acc'), inner = el('div'); inner.appendChild(el('p', null, t('f' + i + 'a', { t: fmtN(c.feeThreshold), f: fmtN(c.feeFixed), p: fmtN(c.feePct) }))); acc.appendChild(inner);
      w.appendChild(q); w.appendChild(acc);
      if (S.faq === i) w.classList.add('open');
      q.setAttribute('aria-expanded', S.faq === i ? 'true' : 'false');
      q.addEventListener('click', function () { S.faq = S.faq === i ? -1 : i; paintFaq(); });
      f.appendChild(w);
    })(i);
  }
  var IC = {
    share: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/>',
    addhome: '<rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M12 8v8M8 12h8"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
    chrome: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5h8.2M8.9 14l-4.1-7.1M15.1 14l-4.1 7.1"/>',
    dots: '<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>',
    install: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M12 7.5v7"/><path d="M9 11.8l3 3 3-3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M11 18.5h2"/>'
  };
  function ico(k, w) { return '<svg aria-hidden="true" width="' + (w || 24) + '" height="' + (w || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>'; }
  function fillApp(g) {
    g.textContent = '';
    g.appendChild(el('p', 'sub', t('ap_intro')));
    var order = OS === 'android' ? ['and', 'ios', 'pc'] : OS === 'desktop' ? ['pc', 'ios', 'and'] : ['ios', 'and', 'pc'];
    var mineKey = OS === 'android' ? 'and' : OS === 'ios' ? 'ios' : 'pc';
    var ICONS = { ios: ['compass', 'share', 'addhome', 'check'], and: ['chrome', 'dots', 'install', 'check'], pc: ['pc'] };
    order.forEach(function (k) {
      var x = el('div', 'panelbox plat'), hd = el('div', 'plath'), pi = el('span', 'pico'); pi.innerHTML = ico(k === 'pc' ? 'pc' : 'phone', 20);
      hd.appendChild(pi); hd.appendChild(el('b', null, t('ap_' + k + '_t'))); if (k === mineKey) hd.appendChild(el('span', 'mine', t('mine'))); x.appendChild(hd);
      var n = k === 'pc' ? 1 : 4;
      for (var i = 1; i <= n; i++) {
        var r = el('div', 'istep'); if (k !== 'pc') r.appendChild(el('i', null, String(i)));
        r.appendChild(el('span', null, t('ap_' + k + '_' + i)));
        var ic = el('span', 'sico'); ic.innerHTML = ico(ICONS[k][i - 1]); r.appendChild(ic); x.appendChild(r);
      }
      if (k !== 'pc') x.appendChild(el('div', 'inote', t('ap_' + k + '_n')));
      g.appendChild(x);
    });
  }
  function renderGuide() { fillSteps($('#gComo')); fillQuick($('#gGuia')); fillFaq($('#gFaq')); fillApp($('#gApp')); }
  var guideKey = '';
  function setGuideTab() {
    $$('#gtabs .chip').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-g') === S.gtab); });
    $('#gComo').style.display = S.gtab === 'como' ? 'flex' : 'none';
    $('#gGuia').style.display = S.gtab === 'guia' ? 'flex' : 'none';
    $('#gFaq').style.display = S.gtab === 'faq' ? 'flex' : 'none';
    $('#gApp').style.display = S.gtab === 'app' ? 'flex' : 'none';
  }
  function paintReceive() {
    var k = S.lastCalc || { ok: false };
    var v = k.ok ? ars(S.shown) : '';
    setText('#rBig', v);
    var showTop = S.dir === 'usd' && k.ok;
    $('#stVal').textContent = showTop ? v : '';
    var ll = $('#liveLine'); ll.hidden = !showTop; if (showTop) ll.textContent = 'Recibirás ≈ ' + v;
    $('#stLbl').textContent = showTop ? t('stRecv') : t('stHelp');
  }
  function tween(to) {
    if (S.target === to) return; S.target = to;
    if (S.raf) cancelAnimationFrame(S.raf);
    if (reduce || !isFinite(S.shown)) { S.shown = to; paintReceive(); return; }
    var from = S.shown, t0 = performance.now(), dur = 700;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      S.shown = p >= 1 ? to : from + (to - from) * e; paintReceive();
      if (p < 1) S.raf = requestAnimationFrame(step);
    })(t0);
  }
  var resultBuilt = false;
  function buildResult() {
    if (resultBuilt) return; resultBuilt = true;
    $('#result').innerHTML = '<div class="result"><div class="k" id="rK"></div><div class="big" id="rBig"></div><hr>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' +
      '<div class="r"><span id="rL1"></span><strong id="rV1"></strong></div><div class="r"><span id="rL2"></span><strong id="rV2"></strong></div>' +
      '<div class="r"><span id="rL3"></span><strong id="rV3"></strong></div><div class="r"><span id="rL4"></span><strong id="rV4"></strong></div></div>' +
      '<div class="note" id="rN"></div></div>';
  }
  function isLocked() { return !!(fbOk && S.live && S.cfg.online === false && !S.admin); }
  function applyLock(locked) {
    if (S.lockApplied === locked) return; S.lockApplied = locked;
    ['calc', 'talkCard', 'alertCard'].forEach(function (id) {
      var card = document.getElementById(id); if (!card) return;
      card.classList.toggle('locked', locked);
      Array.prototype.forEach.call(card.children, function (ch) {
        if (ch.classList.contains('lockov')) ch.hidden = !locked;
        else if (locked) ch.setAttribute('inert', ''); else ch.removeAttribute('inert');
      });
    });
    $('#hero').classList.toggle('off', locked);
    $('#histCard').hidden = locked;
    if (locked) { var tt = $('#toast'); tt.classList.remove('show'); }
  }
  S.t0 = Date.now();
  var SB = {
    load: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.55"/></svg>',
    err: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.8a15 15 0 0 1 4-2.4M22 8.8a15 15 0 0 0-8.5-4.7M5 12.9a10 10 0 0 1 3.2-2M19 12.9a10 10 0 0 0-3.7-2.3M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M2 2l20 20"/></svg>',
    none: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };
  function renderState() {
    var box = $('#sbox'); if (!box) return;
    var k = '', waited = Date.now() - S.t0 > 9000;
    if (fbOk && !isLocked()) {
      if (!S.live) k = waited ? 'err' : 'load';
      else if (!S.online && waited) k = 'stale';
      else if (S.open !== false && !S.cfg.hasRate) k = 'none';
    }
    if (!k) { box.hidden = true; return; }
    if (box.getAttribute('data-k') !== k) {
      box.setAttribute('data-k', k);
      $('#sbIco').innerHTML = SB[k === 'stale' ? 'err' : k];
      var p = { load: 'sbLoad', err: 'sbErr', stale: 'sbStale', none: 'sbNone' }[k];
      $('#sbTitle').textContent = t(p + 'T'); $('#sbMsg').textContent = t(p + 'M');
      $('#sbRetry').hidden = (k === 'load' || k === 'none'); $('#sbSkl').hidden = (k !== 'load');
    }
    box.hidden = false;
  }
  function renderFoot() {
    var c = S.cfg; if (!$('#fHoursTxt')) return;
    setText('#fHoursTxt', c.hoursOn ? t('fHoursOn', { a: c.hoursFrom, b: c.hoursTo }) : t('fHoursOff'));
    var live = fbOk && S.live, on = live && c.online;
    $('#fDot').className = 'dot ' + (on ? 'g' : 'off');
    setText('#fNow', !fbOk ? '' : (!live ? t('loading') : (on ? t('onChip') : t('offChip'))));
  }
  function update() {
    savePrefs();
    var c = S.cfg, k = calc(); S.lastCalc = k; var locked = isLocked();
    var mask = locked || (fbOk && (!S.live || !c.hasRate));
    renderState(); renderFoot();
    /* cotización */
    setText('#officialBig', mask ? '$ ·····' : ars(c.rate)); if ($('#calc')) $('#calc').classList.toggle('dim', mask && !locked);
    var tr = $('#trend');
    if (c.prev > 0 && c.prev !== c.rate && S.live && !locked) { var df = c.rate - c.prev; tr.textContent = (df > 0 ? '▲ +' : '▼ −') + fmtN(Math.abs(df)); } else tr.textContent = '';
    setText('#updTxt', locked ? t('offHero') : (c.updatedAt ? t('upd', { d: whenTxt(c.updatedAt) }) : t('updNone')));
    var dot = $('#liveDot'), lt = $('#liveTxt');
    if (locked) { dot.className = 'dot off'; lt.textContent = t('liveClosed'); }
    else if (!fbOk) { dot.className = 'dot off'; lt.textContent = t('liveDemo'); }
    else if (S.online && S.live) { dot.className = 'dot g'; lt.textContent = t('liveOn'); }
    else { dot.className = 'dot off'; lt.textContent = t('liveOff'); }
    var sell = c.rateSell > 0 && !locked, hs = $('#heroSell'); hs.hidden = !sell; if (sell) setText('#sellBig', ars(c.rateSell));
    /* gráfica */
    var h = histList(), pts = h.slice(0, 8).reverse().map(function (x) { return x.rate; }), sp = $('#spark');
    if (pts.length >= 2 && !locked) {
      var mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts), span = mx - mn || 1;
      var xy = pts.map(function (v, i) { return [i * (300 / (pts.length - 1)), 52 - ((v - mn) / span) * 44]; });
      var ln = xy.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      $('#sparkLine').setAttribute('d', ln); $('#sparkArea').setAttribute('d', ln + ' L300 60 L0 60 Z');
      $('#sparkDot').setAttribute('cx', xy[xy.length - 1][0]); $('#sparkDot').setAttribute('cy', xy[xy.length - 1][1]); sp.hidden = false;
    } else sp.hidden = true;
    /* aviso */
    var an = (c.announcement || '').trim(); $('#ann').hidden = !an; if (an) setText('#annTxt', an);
    /* horario */
    var chip = $('#hoursChip'), a = toMin(c.hoursFrom), b = toMin(c.hoursTo);
    if (fbOk && S.live && !c.online) { chip.hidden = false; $('#hoursDot').className = 'dot off'; setText('#hoursTxt', c.offReason ? t('offChipR', { r: c.offReason }) : t('offChip')); }
    else if (c.hoursOn && a != null && b != null) { chip.hidden = false; $('#hoursDot').className = 'dot g'; setText('#hoursTxt', t('open', { a: c.hoursFrom, b: c.hoursTo })); }
    else if (fbOk && S.live) { chip.hidden = false; $('#hoursDot').className = 'dot g'; setText('#hoursTxt', t('onChip')); }
    else chip.hidden = true;
    /* calculadora */
    var usdOn = S.dir === 'usd';
    $('#sellBox').hidden = !(c.rateSell > 0); setText('#arsTxt', t(c.rateSell > 0 ? 'arsText2' : 'arsText'));
    if (c.rateSell > 0) {
      setText('#sellShow', ars(c.rateSell)); var pr = arsPair(), al = $('#arsLive'); al.hidden = !(pr.p > 0);
      if (pr.p > 0) al.textContent = S.arsLast === 'usd' ? t('arsPayTxt', { v: ars(pr.p) }) : t('arsLiveTxt', { v: usd(pr.u) });
      var ia = $('#arsAmount'), iu = $('#usdWant');
      if (S.arsLast === 'usd' && document.activeElement !== ia) ia.value = pr.p > 0 ? inN(Math.round(pr.p * 100) / 100) : '';
      if (S.arsLast === 'ars' && document.activeElement !== iu) iu.value = pr.u > 0 ? inN(Math.round(pr.u * 100) / 100) : '';
    }
    $('#usdPane').style.display = usdOn ? 'flex' : 'none'; $('#arsPane').hidden = usdOn;
    $('#dirTabs').classList.toggle('b', !usdOn);
    $$('#dirTabs button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-dir') === S.dir); });
    var chips = $('#chips');
    if (!chips.children.length) [50, 100, 200, 500].forEach(function (v) {
      var bt = el('button', 'chip', String(v)); bt.type = 'button'; bt.addEventListener('click', function () { S.amount = String(v); $('#amount').value = S.amount; update(); }); chips.appendChild(bt);
    });
    $$('#chips .chip').forEach(function (x, i) { x.classList.toggle('on', k.amt === [50, 100, 200, 500][i]); });
    var rateEl = $('#rate'), allow = c.allowManual;
    setText('#rateShow', ars(k.rate));
    $('#rateAdj').hidden = !allow; $('#rateLock').hidden = allow;
    $('#rateTag').hidden = !(allow && k.useM && k.rate !== c.rate);
    $('#rateBox').classList.toggle('open', allow && !!S.rateOpen);
    setText('#rateAdj', S.rateOpen ? 'Listo' : 'Ajustar');
    if (allow && S.manual === null && document.activeElement !== rateEl) rateEl.value = inN(c.rate);
    setText('#rateHelp', t('helpManual', { r: ars(c.rate) }));
    var rs = $('#rateReset'); rs.hidden = !(allow && k.useM && k.rate !== c.rate); rs.textContent = t('reset', { r: ars(c.rate) });
    $('#seg').classList.toggle('b', S.mode !== 'incluida');
    $$('#seg button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-mode') === S.mode); });
    setText('#modeHelp', t(S.mode === 'incluida' ? 'modeIncl' : 'modeApart'));
    buildResult();
    $('#result').hidden = !k.ok; $('#hintBox').hidden = k.ok;
    if (k.ok) {
      setText('#rK', t('recv')); setText('#rL1', t('rAmt')); setText('#rV1', usd(k.amt)); setText('#rL2', t('rFee') + ' (' + k.feeLabel + ')'); setText('#rV2', usd(k.fee));
      setText('#rL3', t('rPay')); setText('#rV3', usd(k.pay)); setText('#rL4', t('rRate')); setText('#rV4', ars(k.rate)); setText('#rN', t('freeze'));
    }
    tween(k.ok ? k.receive : 0); paintReceive();
    /* mensaje + enlaces */
    var msg = message(k); var mb = $('#msgbox'); if (mb.value !== msg) mb.value = msg;
    $$('[data-wa]').forEach(function (x) { x.href = 'https://wa.me/' + PHONES[x.getAttribute('data-wa')] + '?text=' + encodeURIComponent(msg); });
    if ($('#sheet2') && $('#sheet2').classList.contains('open')) renderPickSummary();
    $('#copyBtn').classList.toggle('ok', S.copied); setText('#copyTxt', t(S.copied ? 'copied' : 'copy')); setText('#stCopyTxt', S.copied ? '¡Copiado!' : 'Copiar'); setText('#stCopyTxt', S.copied ? '¡Copiado!' : 'Copiar');
    /* guía (se redibuja si cambia el idioma o las comisiones) */
    var gk = S.lang + '|' + c.feeFixed + '|' + c.feeThreshold + '|' + c.feePct + '|' + OS;
    if (gk !== guideKey) { guideKey = gk; renderGuide(); setGuideTab(); }
    /* historial */
    var hl = $('#histList'); hl.textContent = '';
    h.slice(0, 6).forEach(function (x, i) {
      var o = h[i + 1], d = '', r = el('div', 'hrow'); r.appendChild(el('span', 'sub', whenTxt(x.at)));
      var rt = el('span'); rt.style.cssText = 'display:flex;gap:10px;align-items:center';
      if (o && x.rate !== o.rate) { var s = el('span', null, (x.rate > o.rate ? '▲ +' : '▼ −') + fmtN(Math.abs(x.rate - o.rate))); s.style.cssText = 'font-size:13px;font-weight:700;color:#7B5BE0'; rt.appendChild(s); }
      var st = el('strong', null, ars(x.rate)); st.style.cssText = "font:700 16px 'Sora',sans-serif"; rt.appendChild(st); r.appendChild(rt); hl.appendChild(r);
    });
    $('#histEmpty').hidden = h.length > 0;
    /* instalar */
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    var ic = $('#installCard');
    if (standalone || OS === 'desktop') ic.hidden = true;
    else { ic.hidden = false; setText('#instTxt', t(OS === 'ios' ? 'instIos' : 'instAndroid')); $('#instBtn').hidden = !(OS === 'android' && S.dip); }
    $('#revCard').hidden = locked || !S.reviews.length;
    applyLock(locked);
    $('#sticky').classList.toggle('show', S.splashDone === true && !locked);
    syncOff();
  }

  /* ---------- eventos ---------- */
  var amountEl = $('#amount'), rateEl = $('#rate');
  /* Recordar último monto y dirección (solo números; caduca a los 30 días) */
  (function () {
    try {
      var p = JSON.parse(localStorage.getItem('pp_last') || 'null');
      if (!p || Date.now() - (+p.at || 0) > 30 * 86400000) return;
      var ok = function (v) { return typeof v === 'string' && /^[0-9.,]{1,12}$/.test(v); };
      if (p.dir === 'usd' || p.dir === 'ars') S.dir = p.dir;
      if (ok(p.amount)) { S.amount = p.amount; amountEl.value = p.amount; }
      if (ok(p.ars)) { S.arsAmount = p.ars; $('#arsAmount').value = p.ars; }
      if (ok(p.usd)) { S.usdWant = p.usd; $('#usdWant').value = p.usd; }
      if (p.last === 'usd' || p.last === 'ars') S.arsLast = p.last;
    } catch (e) {}
  })();
  var prefT = null;
  function savePrefs() {
    if (S.admin) return; clearTimeout(prefT);
    prefT = setTimeout(function () { try { localStorage.setItem('pp_last', JSON.stringify({ dir: S.dir, amount: String(S.amount || '').slice(0, 12), ars: String(S.arsAmount || '').slice(0, 12), usd: String(S.usdWant || '').slice(0, 12), last: S.arsLast, at: Date.now() })); } catch (e) {} }, 600);
  }
  bindClean(amountEl); bindClean(rateEl); bindClean($('#alTarget')); bindClean($('#arsAmount'));
  bindClean($('#usdWant'));
  $('#arsAmount').addEventListener('input', function (e) { S.arsAmount = e.target.value; S.arsLast = 'ars'; update(); });
  $('#usdWant').addEventListener('input', function (e) { S.usdWant = e.target.value; S.arsLast = 'usd'; update(); });
  $('#usdWant').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.blur(); });
  $('#arsAmount').addEventListener('keydown', function (e) { if (e.key === 'Enter') e.target.blur(); });
  $('#histToggle').addEventListener('click', function () { var w = $('#histWrap'), o = !w.classList.contains('open'); w.classList.toggle('open', o); this.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  amountEl.addEventListener('input', function () { S.amount = amountEl.value; update(); });
  amountEl.addEventListener('focus', function () { var e = amountEl; setTimeout(function () { try { e.select(); } catch (x) {} }, 30); });
  [amountEl, rateEl].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') x.blur(); }); });
  $('#rateAdj').addEventListener('click', function () { S.rateOpen = !S.rateOpen; update(); if (S.rateOpen) setTimeout(function () { rateEl.focus(); }, 350); });
  rateEl.addEventListener('input', function () { S.manual = rateEl.value; update(); });
  $('#rateReset').addEventListener('click', function () { S.manual = null; rateEl.value = inN(S.cfg.rate); update(); });
  $$('#seg button').forEach(function (b) { b.addEventListener('click', function () { S.mode = b.getAttribute('data-mode'); update(); }); });
  function linesFor(nm) { var d = themeDef(), who = String(nm || 'Justo').toLowerCase(); if (d && d.costumes && d.costumes[who]) { var c = d.costumes[who]; return c[S.costume % c.length].say; } return SAY[nm] || SAY.Justo; }
  var SAY = { Justo: ['¡Hola, soy Justo! 🤠', '¡Cambiemos hoy! 💵', 'Aquí para ayudarte ✅'], Boris: ['¡Hola, soy Boris! 😎', 'Cambio rápido y seguro ⚡', 'Tu plata, bien cuidada 🔒'] };
  /* Las burbujas se anclan a la página (position:absolute) y se mueven con el scroll sin ningún código extra: cero vibración.
     Solo si la mascota está en algo fijo (aparición lateral, menú de cambio, pantalla de apagado) la burbuja también es fija. */
  function clearBubbles() { $$('.bubble').forEach(function (o) { if (o.parentNode) o.parentNode.removeChild(o); }); }
  function say(node, text) {
    clearBubbles();                                                                                    // una sola burbuja a la vez
    var dur = Math.max(2800, Math.min(6500, 1600 + text.length * 70)), fixed = !!(node.closest && node.closest('.peek,.stroll,.sheetpanel,.off'));
    var b = document.createElement('div');
    b.className = 'bubble' + (fixed ? '' : ' abs'); b.textContent = text; b.style.cssText = 'left:0;top:0;visibility:hidden;animation-duration:' + dur + 'ms';
    document.body.appendChild(b);
    var r = node.getBoundingClientRect(), cx = r.left + r.width / 2, w = b.offsetWidth, bx = Math.max(w / 2 + 8, Math.min(innerWidth - w / 2 - 8, cx));
    b.style.left = bx + 'px'; b.style.top = (fixed ? Math.max(56, r.top - 8) : r.top + (window.pageYOffset || 0) - 8) + 'px';
    b.style.setProperty('--tx', Math.max(-w / 2 + 16, Math.min(w / 2 - 16, cx - bx)) + 'px'); b.style.visibility = '';
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, dur + 120);
    return dur;
  }
  /* al abrir "¿Con quién haces el cambio?" las mascotas saludan */
  var greetT = [];
  function stopGreet() { greetT.forEach(clearTimeout); greetT = []; clearBubbles(); }
  function greetPick() {
    stopGreet();
    var av = $$('#pick .avatar'); if (!av.length) return;
    function isOpen() { var sh = $('#sheet2'); return sh && sh.classList.contains('open'); }
    function step(k, delay) {
      greetT.push(setTimeout(function () {
        if (!isOpen()) return;
        var m = av[k % av.length], nm = (m.getAttribute('alt') || 'Justo').split(',')[0].trim(), L = linesFor(nm), txt = k === 0 ? '¿En qué te puedo ayudar? 💬' : (k === 1 ? L[0] : L[Math.floor(Math.random() * L.length)]);
        hop(m); if (k < 2) burst(m, false);
        step(k + 1, say(m, txt) + (k < 2 ? 700 : 2600));                                        // espera a que termine de leerse + una pausa
      }, delay));
    }
    step(0, 800);
  }
  /* Sonidos de Halloween sintetizados con WebAudio (sin archivos). Solo suenan con un toque del cliente y se pueden silenciar con el botón 🔔 */
  var AC = null; try { S.sfxOn = localStorage.getItem('pp_sfx') !== '0'; } catch (e) { S.sfxOn = true; }
  function sfxCtx() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (AC.state === 'suspended') AC.resume(); return AC; }
  function note(c, f0, f1, t0, dur, type, vol, lp) {
    var o = c.createOscillator(), g = c.createGain(), now = c.currentTime + t0, out = g;
    o.type = type; o.frequency.setValueAtTime(f0, now); if (f1) o.frequency.exponentialRampToValueAtTime(f1, now + dur);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    if (lp) { var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; g.connect(f); out = f; }
    o.connect(g); out.connect(c.destination); o.start(now); o.stop(now + dur + 0.05);
  }
  var SFX = {
    ding:  function (c) { note(c, 1046, 0, 0, .35, 'sine', .12); note(c, 1568, 0, .09, .45, 'sine', .1); },
    chime: function (c) { note(c, 880, 0, 0, .6, 'triangle', .1); note(c, 1318, 0, .12, .7, 'sine', .09); note(c, 1760, 0, .26, .8, 'sine', .06); },
    boo:   function (c) { note(c, 220, 110, 0, .55, 'sawtooth', .12, 700); note(c, 165, 82, .05, .55, 'square', .05, 500); },
    bat:   function (c) { note(c, 1800, 3200, 0, .12, 'sine', .08); note(c, 2400, 3600, .15, .12, 'sine', .07); note(c, 2000, 3000, .3, .1, 'sine', .06); },
    ghost: function (c) { var o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(), n = c.currentTime;
             o.type = 'sine'; o.frequency.setValueAtTime(620, n); o.frequency.exponentialRampToValueAtTime(300, n + .9); l.frequency.value = 7; lg.gain.value = 18; l.connect(lg); lg.connect(o.frequency);
             g.gain.setValueAtTime(.0001, n); g.gain.exponentialRampToValueAtTime(.11, n + .1); g.gain.exponentialRampToValueAtTime(.0001, n + .95); o.connect(g); g.connect(c.destination); o.start(n); l.start(n); o.stop(n + 1); l.stop(n + 1); }
  };
  function sfxPlay(name) {
    if (!S.sfxOn || !themeDef()) return; var c = sfxCtx(); if (!c) return;
    if (name === 'random') { var k = ['chime', 'boo', 'bat', 'ghost']; name = k[Math.floor(Math.random() * k.length)]; }
    try { SFX[name](c); } catch (e) {}
  }
  function syncSfxBtn() {
    var b = $('#sfxBtn'), on = !!themeDef();
    if (on && !b) { b = document.createElement('button'); b.id = 'sfxBtn'; b.type = 'button'; b.className = 'sfxbtn'; ($('.head') || document.body).appendChild(b);
      b.addEventListener('click', function () { S.sfxOn = !S.sfxOn; try { localStorage.setItem('pp_sfx', S.sfxOn ? '1' : '0'); } catch (e) {} syncSfxBtn(); if (S.sfxOn) sfxPlay('chime'); }); }
    if (!on && b) { b.parentNode.removeChild(b); return; }
    if (b) { b.textContent = S.sfxOn ? '🔔' : '🔕'; b.setAttribute('aria-label', S.sfxOn ? 'Silenciar sonidos' : 'Activar sonidos'); b.title = b.getAttribute('aria-label'); }
  }
  function hop(m) { m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); setTimeout(function () { m.classList.remove('hop'); }, 650); }
  function burst(node, talk) {
    var r = node.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, g = ['$', '₱', '✦', '$', '₱'];
    for (var i = 0; i < 10; i++) {
      var sp = document.createElement('span'), a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5, d = 46 + Math.random() * 40;
      sp.className = 'spark'; sp.textContent = g[i % g.length]; sp.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d - 20).toFixed(0) + 'px;--rot:' + ((Math.random() * 140) - 70).toFixed(0) + 'deg;color:' + (i % 3 ? '#FFD54A' : '#fff');
      document.body.appendChild(sp); setTimeout((function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; })(sp), 950);
    }
    if (talk) { var nm = (node.getAttribute('alt') || '').split(',')[0].trim(), L = linesFor(nm); say(node, L[Math.floor(Math.random() * L.length)]); }
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
  }
  $$('.mini').forEach(function (m) { m.addEventListener('click', function () { stopChat(); hop(m); burst(m, true); sfxPlay('random'); }); });
  /* Al llegar a Justo y Boris (sección de marca) conversan solos, una vez por visita */
  var CHAT = [[0, '¡Hola, soy Justo! 🤠'], [1, '¡Hola, soy Boris! 😎'], [0, '¡Cambiemos hoy! 💵'], [1, 'Cambio rápido y seguro ⚡'], [0, 'Aquí para ayudarte ✅'], [1, 'Tu plata, bien cuidada 🔒']], chatT = [], lastChat = 0;
  function stopChat() { chatT.forEach(clearTimeout); chatT = []; }
  function playChat() {
    var now = Date.now(), minis = $$('.mini'); if (now - lastChat < 30000 || minis.length < 2) return; lastChat = now; stopChat();
    CHAT.forEach(function (l, i) { chatT.push(setTimeout(function () { var m = minis[l[0]]; hop(m); burst(m, false); say(m, l[1]); }, 700 + i * 3300)); });
  }
  if ('IntersectionObserver' in window && $('.brand')) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) playChat(); else stopChat(); }); }, { threshold: 0.5, rootMargin: '-60px 0px -150px 0px' }).observe($('.brand'));
  }
  /* Al llegar a "Habla con un administrador" las mascotas saludan y dicen sus frases (una vez cada 25 s; se corta si te vas) */
  var talkT = [], lastTalk = 0;
  function stopTalk() { talkT.forEach(clearTimeout); talkT = []; clearBubbles(); }
  function playTalk() {
    var now = Date.now(), av = $$('#talkCard .avatar'); if (now - lastTalk < 25000 || av.length < 2 || isLocked()) return; lastTalk = now; stopTalk();
    var seq = [[0, '¿En qué te puedo ayudar? 💬'], [1, null], [0, null], [1, null]], at = 700;
    seq.forEach(function (l, i) {
      talkT.push(setTimeout(function () {
        var m = av[l[0]], L = linesFor(l[0] ? 'Boris' : 'Justo'), txt = l[1] || L[(i + Math.floor(Math.random() * L.length)) % L.length];
        hop(m); burst(m, false); say(m, txt);
      }, at));
      at += Math.max(2800, Math.min(6500, 1600 + (l[1] || 'xxxxxxxxxxxxxxxxxxxxxxxxx').length * 70)) + 500;
    });
  }
  if ('IntersectionObserver' in window && $('#talkCard')) {
    var tcAv = $('#talkCard .adm');
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) playTalk(); else stopTalk(); }); }, { threshold: 0.6, rootMargin: '-60px 0px -170px 0px' }).observe(tcAv || $('#talkCard'));
  }
  /* Los que duermen en la pantalla de apagado también responden al toque */
  /* ---------- Temáticas (themes.js). La activa el administrador desde el panel y la ven todos al instante ---------- */
  var TH = window.PP_THEMES || {};
  $$('img').forEach(function (i) { var m = (i.getAttribute('src') || '').match(/^assets\/(justo|boris)\.webp$/); if (m) i.setAttribute('data-av', m[1]); });
  try { S.themePub = localStorage.getItem('pp_theme') || ''; var w0 = JSON.parse(localStorage.getItem('pp_theme_win') || '{}'); S.themeFrom = w0.f || ''; S.themeTo = w0.t || ''; } catch (e) {}          // última temática conocida: la carga ya sale con el tema
  (function () { var q = location.search.match(/[?&]tema=([a-z0-9_-]+)/) || (/[?&]halloween=1/.test(location.search) ? [0, 'halloween'] : null); if (q && TH[q[1]]) S.themePreview = q[1]; })();
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function inWindow() { var t = todayStr(); return !((S.themeFrom && t < S.themeFrom) || (S.themeTo && t > S.themeTo)); }      // fuera de las fechas programadas se ve el diseño normal
  function fmtD(d) { var p = String(d || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] : ''; }
  function normTheme(id) { return id === 'dracula_lobo' ? 'halloween' : id; }
  function themeDef() { return (S.themeApplied && TH[S.themeApplied]) || null; }
  S.costume = Math.random() < 0.5 ? 0 : 1;          // cada visita arranca con una pareja distinta al azar
  function costumeSrc(who) {
    var d = themeDef(); if (d && d.costumes && d.costumes[who]) { var c = d.costumes[who]; return c[S.costume % c.length].img; }
    return (d && d.avatars && d.avatars[who]) || 'assets/' + who + '.webp';
  }
  /* cambia la foto de una mascota; si pide animación, da la vuelta (flip) y cambia a mitad */
  function paintAvatar(i, animate) {
    var src = costumeSrc(i.getAttribute('data-av')); if (i.getAttribute('src') === src) return;
    if (!animate || !i.animate) { i.src = src; return; }
    var pre = new Image(); pre.src = src;
    var go = function () {                                                                              // se difumina, cambia la imagen y vuelve a aparecer (sin saltos)
      var out = i.animate([{ opacity: 1, filter: 'blur(0px) brightness(1)' }, { opacity: 0, filter: 'blur(7px) brightness(1.5)' }], { duration: 480, easing: 'ease-in-out', fill: 'forwards' });
      out.onfinish = function () {
        i.src = src;
        var inn = i.animate([{ opacity: 0, filter: 'blur(7px) brightness(1.5)' }, { opacity: 1, filter: 'blur(0px) brightness(1)' }], { duration: 620, easing: 'ease-out' });
        out.cancel(); inn.onfinish = function () { inn.cancel(); };
      };
    };
    if (pre.decode) pre.decode().then(go, go); else go();
  }
  function paintAll(who, animate) { $$('img[data-av]').forEach(function (i) { if (!who || i.getAttribute('data-av') === who) paintAvatar(i, animate); }); }
  function visibleMascot() {
    var l = $$('img[data-av]'); for (var k = 0; k < l.length; k++) { var r = l[k].getBoundingClientRect(); if (r.width > 20 && r.top > 60 && r.bottom < innerHeight - 90 && l[k].offsetParent !== null) return l[k]; } return null;
  }
  /* cada ~9 s las mascotas se cambian de disfraz: Justo (Frankenstein ⇄ Vampiro) y Boris (Momia ⇄ Lobo) */
  setInterval(function () {
    var d = themeDef(); if (!d || !d.costumes || document.hidden) return;
    S.costume++; paintAll('justo', true); setTimeout(function () { paintAll('boris', true); }, 700);
    setTimeout(function () { var m = visibleMascot(); if (m && Math.random() < 0.6) { var L = linesFor(m.getAttribute('data-av') === 'boris' ? 'Boris' : 'Justo'); hop(m); say(m, L[Math.floor(Math.random() * L.length)]); } }, 2600);
  }, 12000);
  /* ---------- Intro en video de la temática: aparece con fundido sobre la pantalla de carga y se disuelve hacia la página ---------- */
  function introSeen() { try { return Date.now() - (+localStorage.getItem('pp_intro') || 0) < 6 * 3600 * 1000; } catch (e) { return false; } }   // una vez cada 6 horas
  function maybeIntro() {
    var d = themeDef(); if (!d || !d.intro || S.introStarted) return;
    var force = /[?&]intro=1/.test(location.search);                                  // ?intro=1 lo fuerza (para probarlo)
    if (!force) {
      if (S.themePreview !== undefined || introSeen() || (window.performance && performance.now() > 5000)) return;
      try { if (matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData)) return; } catch (e) {}
    }
    S.introStarted = true; S.introPlaying = true;
    var ov = document.createElement('div'); ov.id = 'intro'; ov.className = 'intro'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<canvas class="ibg" width="64" height="36"></canvas><video class="ivid" muted playsinline webkit-playsinline preload="auto"></video><div class="ivig"></div>' +
      '<button type="button" class="ibtn iskip">Saltar ›</button><button type="button" class="ibtn isnd" aria-label="Activar sonido">🔇</button>';
    var v = ov.querySelector('video'), cv = ov.querySelector('canvas'), cx = cv.getContext && cv.getContext('2d'), over = false, raf = 0;
    if (d.introPoster) v.setAttribute('poster', d.introPoster);
    document.body.appendChild(ov);
    function paintBg() { if (over) return; try { if (cx && v.readyState >= 2) cx.drawImage(v, 0, 0, cv.width, cv.height); } catch (e) {} raf = requestAnimationFrame(paintBg); }
    function finish(fast) {
      if (over) return; over = true; cancelAnimationFrame(raf); clearTimeout(guard);
      try { localStorage.setItem('pp_intro', String(Date.now())); } catch (e) {}
      ov.classList.add(fast ? 'out fast' : 'out'); document.body.style.overflow = ''; S.introPlaying = false;
      setTimeout(function () { try { v.pause(); } catch (e) {} if (ov.parentNode) ov.parentNode.removeChild(ov); maybeInitialToast(); }, fast ? 450 : 1100);
    }
    function abort() { if (over) return; over = true; cancelAnimationFrame(raf); clearTimeout(guard); S.introPlaying = false; document.body.style.overflow = ''; if (ov.parentNode) ov.parentNode.removeChild(ov); }
    var started = false, guard = setTimeout(abort, 3500);                                // si el video tarda en estar listo, no molesta: se omite
    function go() {
      if (started || over) return; started = true; clearTimeout(guard);
      var pr = v.play(); if (pr && pr.catch) pr.catch(abort);
      document.body.style.overflow = 'hidden'; ov.classList.add('show'); paintBg();
      guard = setTimeout(function () { finish(); }, ((v.duration || 9) + 2) * 1000);
    }
    v.addEventListener('canplay', go); v.addEventListener('playing', go);
    v.addEventListener('ended', function () { finish(); });
    v.addEventListener('timeupdate', function () { if (v.duration && v.currentTime > v.duration - 0.6 && !ov.classList.contains('ending')) ov.classList.add('ending'); });   // el último tramo empieza a disolverse
    ov.querySelector('.iskip').addEventListener('click', function () { finish(true); });
    ov.querySelector('.isnd').addEventListener('click', function () { v.muted = !v.muted; this.textContent = v.muted ? '🔇' : '🔊'; });
    var portrait = innerHeight > innerWidth * 1.1, srcV = portrait && d.introV, tried = false;
    v.addEventListener('loadedmetadata', function () { if (v.videoHeight > v.videoWidth) ov.classList.add('vert'); });
    v.addEventListener('error', function () { if (srcV && !tried) { tried = true; srcV = null; v.src = d.intro; v.load(); } else abort(); });      // si el video vertical no existe, usa el horizontal
    v.src = srcV || d.intro; v.load(); try { var p0 = v.play(); if (p0 && p0.catch) p0.catch(function () {}); } catch (e) {}      // iOS a veces no dispara 'canplay' hasta que se intenta reproducir
  }
  function applySeason() {
    var id = normTheme(S.themePreview !== undefined ? S.themePreview : (inWindow() ? (S.themePub || '') : '')), def = id && TH[id] ? TH[id] : null, key = def ? id : '';
    if (key === S.themeApplied) return; S.themeApplied = key;
    var root = document.documentElement; Object.keys(TH).forEach(function (k) { root.classList.remove('th-' + k); }); root.classList.remove('th-halloween');
    if (def && !S.userMode && S.theme !== 'dark') { S.forcedDark = true; applyTheme('dark'); } else if (!def && S.forcedDark && !S.userMode) { S.forcedDark = false; applyTheme('light'); }
    if (def) { root.classList.add('th-' + key); if (def.look) root.classList.add('th-' + def.look); root.classList.add('th-on'); } else root.classList.remove('th-on');
    if (def && def.fonts && !document.getElementById('thFonts')) { var lk = document.createElement('link'); lk.id = 'thFonts'; lk.rel = 'stylesheet'; lk.href = def.fonts; document.head.appendChild(lk); }
    var pre = (def && def.preload) || []; pre.forEach(function (u) { var im = new Image(); im.src = u; });
    if (def && def.costumes) Object.keys(def.costumes).forEach(function (w) { def.costumes[w].forEach(function (c) { var im = new Image(); im.src = c.img; }); });
    if (def && def.logo) { var lg = new Image(); lg.src = def.logo; }
    paintAll(null, false);
    $$('img.logoimg').forEach(function (i) { var src = (def && def.logo) || 'assets/logo.webp'; if (i.getAttribute('src') !== src) i.src = src; });
    try { var sp = $('#splash'); if (sp) sp.setAttribute('data-scene', (def && def.splash) || sceneNow()); } catch (e) {}
    if (def && def.peeks && def.peeks.length) setTimeout(function () { if (!S.introPlaying) peek(); else setTimeout(peek, 5000); }, 7000);
    syncSfxBtn();
    maybeIntro();
  }
  setInterval(function () { applySeason(); }, 60000); document.addEventListener('visibilitychange', function () { if (!document.hidden) applySeason(); });
  function peek() {
    var def = themeDef(); if (!def || !def.peeks || !def.peeks.length || S.peeking || S.introPlaying || document.hidden || (S.admin && S.themePreview === undefined)) return;
    var sh = $('#sheet2'), off = $('#off'); if ((sh && sh.classList.contains('open')) || (off && !off.hidden)) return;
    var worn = [costumeSrc('justo'), costumeSrc('boris')], pool = def.peeks.filter(function (p) { return worn.indexOf(p.img) < 0; }); if (!pool.length) pool = def.peeks;   // no repetir el disfraz que ya llevan puesto
    var P = pool[Math.floor(Math.random() * pool.length)], left = Math.random() < 0.5, w = document.createElement('div'), im = document.createElement('img');
    if (!w.animate) return; S.peeking = true;
    var fail = setTimeout(function () { S.peeking = false; if (w.parentNode) w.parentNode.removeChild(w); }, 16000);   // seguro: nunca se queda trabado
    w.className = 'peek ' + (left ? 'l' : 'r'); w.style.bottom = (22 + Math.floor(Math.random() * 38)) + '%'; im.src = P.img; im.alt = ''; w.appendChild(im); document.body.appendChild(w);
    var hide = left ? 'translateX(-100%)' : 'translateX(100%)', show = left ? 'translateX(-34%)' : 'translateX(34%)';
    var a1 = w.animate([{ transform: hide }, { transform: show }], { duration: 900, easing: 'cubic-bezier(.2,1.3,.4,1)', fill: 'forwards' });
    a1.onfinish = function () {
      var txt = (P.say && P.say.length) ? P.say[Math.floor(Math.random() * P.say.length)] : '¡Buuu! 🎃', dur = say(w, txt);   // SIEMPRE dice su frase y se queda hasta que termine de leerse
      setTimeout(function () { var a2 = w.animate([{ transform: show }, { transform: hide }], { duration: 700, easing: 'ease-in', fill: 'forwards' }); a2.onfinish = function () { clearTimeout(fail); if (w.parentNode) w.parentNode.removeChild(w); S.peeking = false; }; }, dur + 300);
    };
  }
  setInterval(function () { if (Math.random() < 0.7) peek(); }, 18000);
  function renderThemes() {
    var box = pa('aThemeList'); if (!box) return; box.textContent = '';
    var ids = Object.keys(TH), pub = normTheme(S.themePub || '');
    if (!ids.length) { box.appendChild(el('div', 'sub', 'No hay temáticas instaladas (falta themes.js).')); return; }
    ids.forEach(function (id) {
      var d = TH[id], on = pub === id, pv = S.themePreview === id, wrap = el('div'), row = el('div', 'alrow' + (on ? ' hit' : '')), b = el('div', 'b');
      row.appendChild(el('div', 'nm', d.emoji + ' ' + d.name + (on ? ' · ACTIVA para todos' : '') + (pv ? ' · vista previa (solo tú)' : '')));
      function btn(txt, css, fn) { var z = el('button', null, txt); z.type = 'button'; z.style.cssText = css; z.addEventListener('click', fn); b.appendChild(z); }
      btn(pv ? 'Quitar vista' : 'Probar', 'background:var(--card);color:var(--ink);border:2px solid var(--fline)', function () { S.themePreview = pv ? undefined : id; applySeason(); renderThemes(); msgA(pv ? 'Vista previa cerrada.' : 'Vista previa de ' + d.name + ': solo la ves tú, los clientes no.'); });
      btn(on ? 'Desactivar' : 'Activar', on ? 'background:#B3261E;color:#fff' : 'background:#0F7A40;color:#fff', function () {
        var prev = { p: S.themePub, f: S.themeFrom, t: S.themeTo }, f = on ? '' : ((pa('aThFrom') || {}).value || S.themeFrom || ''), t = on ? '' : ((pa('aThTo') || {}).value || S.themeTo || '');
        S.themePub = on ? '' : id; S.themeFrom = f; S.themeTo = t; try { localStorage.setItem('pp_theme', S.themePub); localStorage.setItem('pp_theme_win', JSON.stringify({ f: f, t: t })); } catch (e) {} applySeason(); renderThemes();     // se ve al instante; luego se guarda
        db.ref('status').update({ theme: on ? null : id, themeFrom: f || null, themeTo: t || null }).then(function () { msgA(on ? d.name + ' desactivada: todos vuelven al diseño normal.' : d.name + ' ACTIVADA ✓' + (f || t ? ' (programada: ' + (fmtD(f) || 'ya') + ' → ' + (fmtD(t) || 'sin fin') + ')' : ' Los clientes la ven ahora mismo.')); })
          .catch(function (e) { S.themePub = prev.p; S.themeFrom = prev.f; S.themeTo = prev.t; try { localStorage.setItem('pp_theme', prev.p || ''); } catch (x) {} applySeason(); renderThemes(); msgA(/permission|PERMISSION/i.test((e && e.message) || '') ? 'Sin permiso para guardar: publica el firebase.rules.json nuevo en Firebase (agrega los campos theme, themeFrom y themeTo).' : 'No se pudo guardar la temática. Revisa tu conexión.'); });
      });
      row.appendChild(b); wrap.appendChild(row); if (d.desc) wrap.appendChild(el('div', 'sub', d.desc)); box.appendChild(wrap);
    });
    var sch = el('div', 'panelbox'); sch.style.cssText = 'font-size:14px;margin-top:4px'; sch.appendChild(el('div', null, '📅 Programar fechas (opcional). Vacío = sin límite. Fuera de esas fechas el sitio se ve normal, solo.'));
    var rowD = el('div'); rowD.style.cssText = 'display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center';
    function dateIn(id, lab, val) { var w = el('label'); w.style.cssText = 'display:flex;flex-direction:column;gap:3px;font-size:12px;flex:1;min-width:120px'; w.appendChild(el('span', null, lab)); var i = document.createElement('input'); i.type = 'date'; i.id = id; i.className = 'field sm'; i.value = val || ''; w.appendChild(i); rowD.appendChild(w); }
    dateIn('aThFrom', 'Desde', S.themeFrom); dateIn('aThTo', 'Hasta (inclusive)', S.themeTo);
    function dbtn(txt, css, fn) { var z = el('button', null, txt); z.type = 'button'; z.style.cssText = css + ';border-radius:12px;padding:10px 14px;font-weight:700;border:0'; z.addEventListener('click', fn); rowD.appendChild(z); }
    dbtn('Guardar fechas', 'background:#0F7A40;color:#fff', function () {
      var f = pa('aThFrom').value || '', t = pa('aThTo').value || ''; if (f && t && t < f) { msgA('La fecha "Hasta" no puede ser anterior a "Desde".'); return; }
      S.themeFrom = f; S.themeTo = t; try { localStorage.setItem('pp_theme_win', JSON.stringify({ f: f, t: t })); } catch (e) {} applySeason(); renderThemes();
      db.ref('status').update({ themeFrom: f || null, themeTo: t || null }).then(function () { msgA(f || t ? 'Fechas guardadas ✓' : 'Fechas quitadas: sin límite.'); }).catch(function () { msgA('No se pudo guardar. ¿Publicaste las reglas nuevas de Firebase (themeFrom/themeTo)?'); });
    });
    sch.appendChild(rowD); box.appendChild(sch);
    pa('aThemeNow').textContent = pub && TH[pub] ? 'Temática activa: ' + TH[pub].name + ((S.themeFrom || S.themeTo) ? ' · programada ' + (fmtD(S.themeFrom) || 'desde ya') + ' → ' + (fmtD(S.themeTo) || 'sin fin') + (inWindow() ? ' (ahora se ve)' : ' (ahora fuera de fechas: se ve normal)') : '') : 'Ninguna temática activa: se ve el diseño normal.';
  }
  /* Mientras está apagado, las mascotas hablan dormidas y de vez en cuando pasan rodando por la pantalla */
  var OFFTALK = [['Zzz… ¿ya abrimos? 🥱', 'Soñé con dólares 💭', 'Cinco minutitos más… 😴', 'Shhh… el dólar duerme 🤫'], ['Zzz… ¡mi cotización! 💤', 'Estoy descansando, ¿eh? 😎', 'Volvemos enseguida ⏳', 'Zzz… dame un cafecito ☕']];
  var STROLL = { justo: ['¡Solo estiro las piernas! 🚶', '¿Quién apagó la luz? 🔦', 'Boludeando un ratito 😜'], boris: ['Estoy de paseo, ya volvemos 😎', '¡Qué silencio! 🦗', 'Revisando que todo esté en orden 🔍'] };
  function strollOff(ov) {
    if (S.strolling) return; S.strolling = true;
    var who = Math.random() < 0.5 ? 'justo' : 'boris', L = STROLL[who], w = document.createElement('div'), im = document.createElement('img');
    w.className = 'stroll'; im.src = costumeSrc(who); im.alt = ''; w.appendChild(im); ov.appendChild(w);
    var W = ov.clientWidth || innerWidth, mid = Math.round(W / 2 - 34), fin = function () { if (w.parentNode) w.parentNode.removeChild(w); S.strolling = false; };
    if (!w.animate) { fin(); return; }
    var a1 = w.animate([{ transform: 'translateX(-90px) rotate(0deg)' }, { transform: 'translateX(' + mid + 'px) rotate(540deg)' }], { duration: 2600, easing: 'ease-out', fill: 'forwards' });
    a1.onfinish = function () {
      say(w, L[Math.floor(Math.random() * L.length)]); burst(w, false);
      setTimeout(function () {
        var a2 = w.animate([{ transform: 'translateX(' + mid + 'px) rotate(540deg)' }, { transform: 'translateX(' + (W + 90) + 'px) rotate(1080deg)' }], { duration: 2600, easing: 'ease-in', fill: 'forwards' });
        a2.onfinish = fin;
      }, 2300);
    };
  }
  function offAmbient() {
    var ov = $('#off'); if (!ov || ov.hidden || ov.classList.contains('boot') || document.hidden) return;
    var sl = $$('.sl img'); if (Math.random() < 0.5 && sl.length) { var i = Math.floor(Math.random() * sl.length), L = OFFTALK[i % 2]; hop(sl[i]); say(sl[i], L[Math.floor(Math.random() * L.length)]); return; }
    strollOff(ov);
  }
  setInterval(function () { if (Math.random() < 0.75) offAmbient(); }, 9000);
  var ZZ = ['Zzz… cinco minutitos más 😴', 'Zzz… ya volvemos 🌙'];
  $$('.sl img').forEach(function (m, i) { m.addEventListener('click', function () { hop(m); say(m, ZZ[i % 2]); }); });
  $$('.avatar').forEach(function (m) { m.addEventListener('pointerdown', function () { m.classList.remove('tap'); void m.offsetWidth; m.classList.add('tap'); setTimeout(function () { m.classList.remove('tap'); }, 650); burst(m, false); sfxPlay('random'); }); });
  $$('#dirTabs button').forEach(function (b) { b.addEventListener('click', function () { S.dir = b.getAttribute('data-dir'); update(); }); });
  $$('#gtabs .chip').forEach(function (b) { b.addEventListener('click', function () { S.gtab = b.getAttribute('data-g'); setGuideTab(); }); });
  function applyTheme(next) {
    S.theme = next; document.documentElement.setAttribute('data-theme', next);
    $('#themeBtn').setAttribute('aria-label', next === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.setAttribute('content', next === 'dark' ? '#070B26' : '#0F1B5C');
  }
  $('#themeBtn').addEventListener('click', function () {
    var btn = this, next = S.theme === 'light' ? 'dark' : 'light', root = document.documentElement; S.userMode = true;
    btn.classList.add('spin'); setTimeout(function () { btn.classList.remove('spin'); }, 750);
    function fallback() { root.classList.add('theme-anim'); applyTheme(next); setTimeout(function () { root.classList.remove('theme-anim'); }, 1100); }
    if (!document.startViewTransition) { fallback(); return; }
    var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    try {
      var vt = document.startViewTransition(function () { applyTheme(next); });
      vt.ready.then(function () {
        root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 1000, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(function () {});
    } catch (e) { fallback(); }
  });
  ['holder', 'bank', 'alias'].forEach(function (id) { $('#' + id).addEventListener('input', function (e) { S[id] = e.target.value; update(); }); });
  /* Recordar datos del cliente (solo si él lo marca): se guardan únicamente en SU celular, nunca en Firebase. Desmarcar los borra. Caducan a los 180 días. */
  (function () {
    var cb = $('#rememberData'); if (!cb) return;
    var K = { holder: 'h', bank: 'b', alias: 'a' };
    try {
      var p = JSON.parse(localStorage.getItem('pp_data') || 'null');
      if (p && Date.now() - (+p.at || 0) < 180 * 86400000) {
        var any = false;
        Object.keys(K).forEach(function (id) { var v = typeof p[K[id]] === 'string' ? p[K[id]].slice(0, 120) : ''; if (v) { any = true; S[id] = v; $('#' + id).value = v; } });
        if (any) { cb.checked = true; $('#dataWrap').classList.add('open'); $('#dataToggle').setAttribute('aria-expanded', 'true'); try { update(); } catch (e) {} }
      }
    } catch (e) {}
    function save() {
      if (S.admin) return;
      try {
        if (cb.checked && (S.holder || S.bank || S.alias)) localStorage.setItem('pp_data', JSON.stringify({ h: S.holder.slice(0, 120), b: S.bank.slice(0, 120), a: S.alias.slice(0, 120), at: Date.now() }));
        else localStorage.removeItem('pp_data');
      } catch (e) {}
    }
    cb.addEventListener('change', save);
    Object.keys(K).forEach(function (id) { $('#' + id).addEventListener('input', save); });
  })();
  /* globo verde "Mensaje copiado" que se ve incluso encima del menú de "¿Con quién haces el cambio?" */
  var copyToastT;
  function copyToast(msg) {
    var sh = $('#sheet2'); if (!msg && !(sh && sh.classList.contains('open'))) return;
    var n = $('#copyToast'); if (!n) { n = document.createElement('div'); n.id = 'copyToast'; n.setAttribute('role', 'status'); document.body.appendChild(n); }
    n.textContent = msg || ('✓ ' + t('copied')); void n.offsetWidth; n.classList.add('show'); clearTimeout(copyToastT); copyToastT = setTimeout(function () { n.classList.remove('show'); }, 2200);
  }
  /* Confirmación visual del botón de la barra inferior: independiente del resto de la página, así siempre se ve */
  function flashCopied() {
    var b = $('#stCopy'), p = $('#stPop');
    if (b) b.classList.add('ok');
    if (p) { p.textContent = '✓ ' + (t('copied') || 'Mensaje copiado'); p.classList.add('show'); }
    clearTimeout(S.fcT); S.fcT = setTimeout(function () { if (b) b.classList.remove('ok'); if (p) p.classList.remove('show'); }, 2500);
  }
  function copyFail() { copyToast('No se pudo copiar solo: mantén presionado el mensaje y elige Copiar'); }
  function doCopy(auto) {
    var m = $('#msgbox').value;
    function done() { if (auto !== true) bump('copies'); flashCopied(); try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {} try { copyToast(); sfxPlay('ding'); } catch (e) {} S.copied = true; try { update(); } catch (e) {} clearTimeout(S.ct); S.ct = setTimeout(function () { S.copied = false; update(); }, 2500); }
    function fb() {
      try { var x = document.createElement('textarea'); x.value = m; x.setAttribute('readonly', ''); x.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
        document.body.appendChild(x); x.focus(); x.select(); x.setSelectionRange(0, 99999); var ok = document.execCommand('copy'); document.body.removeChild(x); if (ok) done(); else copyFail(); } catch (e) { copyFail(); }
    }
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(done).catch(fb); else fb(); } catch (e) { fb(); }
  }
  $('#copyBtn').addEventListener('click', doCopy);
  $('#stCopy').addEventListener('click', doCopy);
  $('#dataToggle').addEventListener('click', function () {
    var w = $('#dataWrap'), o = !w.classList.contains('open'); w.classList.toggle('open', o); this.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  function setSheet(o) { $('#sheet').classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; if (o) $('#guide').scrollTop = 0; }
  $('#guideLink').addEventListener('click', function () { setSheet(true); });
  $('#guideFoot').addEventListener('click', function () { S.gtab = 'como'; setGuideTab(); setSheet(true); });
  $('#faqFoot').addEventListener('click', function () { S.gtab = 'faq'; setGuideTab(); setSheet(true); });
  $('#appFoot').addEventListener('click', function () { S.gtab = 'app'; setGuideTab(); setSheet(true); });
  $('#instGuide').addEventListener('click', function () { S.gtab = 'app'; setGuideTab(); setSheet(true); });
  $('#sheetClose').addEventListener('click', function () { setSheet(false); });
  $('#sheetBd').addEventListener('click', function () { setSheet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSheet(false); });
  function doShare() {
    var url = location.href.split('#')[0]; try { if (S.themeApplied === 'halloween') url = new URL('halloween.html', url).href; } catch (e) {}
    var text = t('shareText') + ' ' + url;
    function fb() { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); }
    try { if (navigator.share) navigator.share({ title: 'Dólar PesoPro', text: t('shareText'), url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') fb(); }); else fb(); } catch (e) { fb(); }
  }
  $('#shareBtn').addEventListener('click', doShare); $('#shareFoot').addEventListener('click', doShare);
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); S.dip = e; update(); });
  $('#instBtn').addEventListener('click', function () { if (S.dip) { S.dip.prompt(); S.dip = null; update(); } });
  /* Notificación al celular de Justo (app gratuita ntfy). Se activa poniendo window.NTFY_TOPIC en firebase-config.js */
  function ntfyOk(kind) {   // evita avisos repetidos: máximo uno por tipo cada 60 s en este dispositivo
    try { var k = 'pp_ntfy_' + kind, last = +localStorage.getItem(k) || 0; if (Date.now() - last < 60000) return false; localStorage.setItem(k, String(Date.now())); } catch (e) {}
    return true;
  }
  function notifyAdmin(target, phone) {
    var topic = window.NTFY_TOPIC; if (!topic || !ntfyOk('alert')) return;
    try {
      fetch('https://ntfy.sh/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        topic: topic, title: 'Nueva alerta de cotización', message: 'Un cliente pidió aviso a ' + ars(target) + '. Abre el panel para ver quién.',
        priority: 4, tags: ['bell', 'moneybag'], click: location.origin + location.pathname + '#admin' }) }).catch(function () {});
    } catch (e) {}
  }
  $('#alBtn').addEventListener('click', function () {
    var cc = $('#alCc').value, nat = $('#alPhone').value.replace(/\D/g, '').replace(/^0+/, '');
    if (nat.indexOf(cc) === 0 && nat.length > cc.length + 6) nat = nat.slice(cc.length);
    else if (cc === '549' && nat.indexOf('54') === 0 && nat.length > 9) nat = nat.replace(/^549?/, '');
    var target = num($('#alTarget').value), phone = cc + nat, msg = $('#alMsg');
    if (!(target > 0 && target < 100000) || nat.length < 7 || nat.length > 11 || S.alSent >= 3) { msg.textContent = t('alertBad'); msg.style.color = '#E5484D'; return; }
    if (!db) { msg.textContent = t('alertErr'); msg.style.color = '#E5484D'; return; }
    track('alert_request');
    db.ref('alerts').push({ phone: phone, target: target, at: firebase.database.ServerValue.TIMESTAMP }).then(function () {
      notifyAdmin(target, phone); S.alSent++; msg.textContent = t('alertOk'); msg.style.color = 'var(--green)'; $('#alTarget').value = ''; $('#alPhone').value = '';
    }).catch(function () { msg.textContent = t('alertErr'); msg.style.color = '#E5484D'; });
  });

  /* ---------- Tarjeta de la cotización: imagen vertical 1080×1920 para WhatsApp (estados) e Instagram (historias) ---------- */
  function loadImg(src) { return new Promise(function (ok, no) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = no; i.src = src; }); }
  function arStamp() {
    try { return new Intl.DateTimeFormat(S.lang === 'en' ? 'en-GB' : 'es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(S.cfg.updatedAt || Date.now())); } catch (e) { return whenTxt(S.cfg.updatedAt || Date.now()); }
  }
  function drawCard() {
    var hw = S.themeApplied === 'halloween', c = S.cfg, W = 1080, H = 1920, rate = c.rate;
    var fonts = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('800 100px Sora'), document.fonts.load('700 40px "Plus Jakarta Sans"')]).catch(function () {}) : null;
    return Promise.all([loadImg(hw ? 'assets/logo-halloween.webp' : 'assets/logo.webp'), loadImg('assets/qr.png').catch(function () { return null; }), fonts]).then(function (r) {
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d'), lg = r[0], X = W / 2;
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, hw ? '#1d0d33' : '#0F1B5C'); bg.addColorStop(1, hw ? '#07030f' : '#0A1038'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      var top = 0;
      if (hw) { var lh = Math.round(lg.height * W / lg.width); g.drawImage(lg, 0, 0, W, lh); var fd = g.createLinearGradient(0, lh - 160, 0, lh); fd.addColorStop(0, 'rgba(10,4,20,0)'); fd.addColorStop(1, '#0d0618'); g.fillStyle = fd; g.fillRect(0, lh - 160, W, 160); top = lh; }
      else { g.fillStyle = '#fff'; g.fillRect(0, 0, W, 780); var lw = 940, lh2 = Math.round(lg.height * lw / lg.width); g.drawImage(lg, (W - lw) / 2, (780 - lh2) / 2, lw, lh2); var fl = ['#F5B800', '#1F3FBF', '#D62839']; fl.forEach(function (col, i) { g.fillStyle = col; g.fillRect(i * W / 3, 780, W / 3, 16); }); top = 796; }
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      function txt(s, y, font, col, ls) { g.font = font; g.fillStyle = col; try { g.letterSpacing = (ls || 0) + 'px'; } catch (e) {} g.fillText(s, X, y); try { g.letterSpacing = '0px'; } catch (e) {} }
      var y = Math.max(top + 130, 930);
      txt(t('cardLbl'), y, "700 40px 'Plus Jakarta Sans',sans-serif", hw ? '#FF9A3C' : '#B8C7FF', 6);
      var big = ars(rate), fs = 230; g.font = "800 " + fs + "px Sora,sans-serif"; while (g.measureText(big).width > 940 && fs > 90) { fs -= 8; g.font = "800 " + fs + "px Sora,sans-serif"; }
      y += fs * 0.95 + 30; txt(big, y, "800 " + fs + "px Sora,sans-serif", hw ? '#FF8A1F' : '#FFC21A');
      y += 78; txt(t('cardPer'), y, "600 54px 'Plus Jakarta Sans',sans-serif", '#fff');
      y += 90; txt(t('cardUpd', { d: arStamp() }), y, "500 38px 'Plus Jakarta Sans',sans-serif", '#C9D1FF');
      var bx = 90, bw = W - 180, bh = 290, by = H - 480; g.fillStyle = 'rgba(255,255,255,.09)'; g.beginPath(); if (g.roundRect) g.roundRect(bx, by, bw, bh, 40); else g.rect(bx, by, bw, bh); g.fill();
      var qs = 220, qx = bx + bw - qs - 35, qy = by + (bh - qs) / 2, tx = bx + 35 + (bw - qs - 105) / 2, tw = bw - qs - 105;
      function txl(s2, y2, font, col) { g.font = font; g.fillStyle = col; g.textAlign = 'center'; g.fillText(s2, tx, y2); }
      txl('✔ ' + t('cardAdm'), by + 86, "700 36px 'Plus Jakarta Sans',sans-serif", '#fff');
      var hf = 76, hd = '@dolarpesopro_'; g.font = "800 " + hf + "px Sora,sans-serif"; while (g.measureText(hd).width > tw && hf > 32) { hf -= 2; g.font = "800 " + hf + "px Sora,sans-serif"; }
      txl(hd, by + 178, "800 " + hf + "px Sora,sans-serif", hw ? '#FF8A1F' : '#FFC21A');
      var ff = 30; g.font = "500 " + ff + "px 'Plus Jakarta Sans',sans-serif"; while (g.measureText(t('cardFind')).width > tw && ff > 20) { ff -= 1; g.font = "500 " + ff + "px 'Plus Jakarta Sans',sans-serif"; }
      txl(t('cardFind'), by + 238, "500 " + ff + "px 'Plus Jakarta Sans',sans-serif", '#C9D1FF');
      if (r[1]) { g.fillStyle = '#fff'; g.beginPath(); if (g.roundRect) g.roundRect(qx - 10, qy - 10, qs + 20, qs + 20, 22); else g.rect(qx - 10, qy - 10, qs + 20, qs + 20); g.fill(); g.drawImage(r[1], qx, qy, qs, qs); }
      txt(t('cardFoot'), H - 120, "500 30px 'Plus Jakarta Sans',sans-serif", 'rgba(201,209,255,.85)');
      return new Promise(function (ok, no) { cv.toBlob(function (b) { b ? ok(b) : no(); }, 'image/png'); });
    });
  }
  function shareUrl() { var u = location.href.split('#')[0].split('?')[0]; try { if (S.themeApplied === 'halloween') u = new URL('halloween.html', u).href; } catch (e) {} return u; }
  function closeCard() { var ov = $('#cardOv'); if (!ov) return; ov.hidden = true; document.body.style.overflow = ''; if (ov._u) { URL.revokeObjectURL(ov._u); ov._u = null; } var b = $('#cardBtn'); if (b) b.focus(); }
  function showCard(blob) {
    var ov = $('#cardOv');
    if (!ov) {
      ov = el('div'); ov.id = 'cardOv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
      ov.innerHTML = '<div class="cbox"><img alt=""><div class="cbtns"><button type="button" class="btn gold" id="cardShare"></button><a class="btn ghost" id="cardDl" download="cotizacion-pesopro.png"></a><button type="button" class="btn ghost" id="cardX"></button></div></div>';
      document.body.appendChild(ov);
      ov.addEventListener('click', function (e) { if (e.target === ov) closeCard(); });
      $('#cardX').addEventListener('click', closeCard);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ov.hidden) closeCard(); });
      $('#cardDl').addEventListener('click', function () { bump('cards'); });
      $('#cardShare').addEventListener('click', function () {
        var f = ov._f; if (!f) return;
        try { navigator.share({ files: [f], text: t('cardText', { r: ars(S.cfg.rate) }) + ' ' + shareUrl() }).then(function () { bump('cards'); track('card_share'); }).catch(function () {}); } catch (e) {}
      });
    }
    if (ov._u) URL.revokeObjectURL(ov._u); ov._u = URL.createObjectURL(blob);
    try { ov._f = new File([blob], 'cotizacion-pesopro.png', { type: 'image/png' }); } catch (e) { ov._f = null; }
    var canShare = !!(ov._f && navigator.canShare && navigator.canShare({ files: [ov._f] }));
    ov.querySelector('img').src = ov._u; ov.querySelector('img').alt = t('cardTitle'); ov.setAttribute('aria-label', t('cardTitle'));
    $('#cardShare').textContent = t('cardShare'); $('#cardShare').hidden = !canShare; $('#cardDl').textContent = t('cardDl'); $('#cardDl').href = ov._u; $('#cardX').textContent = t('cardX');
    ov.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(function () { (canShare ? $('#cardShare') : $('#cardDl')).focus(); }, 30);
  }
  function onCardBtn() {
    if (isLocked() || !(S.cfg.rate > 0) || (fbOk && !S.live)) { copyToast(t('cardWait')); return; }
    var b = this; b.disabled = true; track('card_open');
    drawCard().then(showCard).catch(function () { copyToast(t('cardErr')); }).then(function () { b.disabled = false; });
  }
  $('#cardBtn').addEventListener('click', onCardBtn); if ($('#cardBtn2')) $('#cardBtn2').addEventListener('click', onCardBtn);

  /* ---------- Avisos push al celular (requiere VAPID_KEY en firebase-config.js y la función de Firebase) ---------- */
  (function () {
    var b = $('#alPush'); if (!b || !window.VAPID_KEY) return;
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    var can = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!can && !(OS === 'ios' && !standalone)) return;
    b.hidden = false;
    function say(k, bad) { var m = $('#alMsg'); m.textContent = t(k); m.style.color = bad ? '#E5484D' : 'var(--green)'; }
    function loadMsg() { return new Promise(function (ok, no) { if (firebase.messaging) return ok(); var x = document.createElement('script'); x.src = 'https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js'; x.onload = ok; x.onerror = no; document.head.appendChild(x); }); }
    b.addEventListener('click', function () {
      if (!can) { say('pushIos', true); return; }
      var target = num($('#alTarget').value) || 0; if (target < 0 || target >= 100000) target = 0;
      if (!db || S.pushSent >= 3) { say('pushErr', true); return; }
      b.disabled = true;
      Notification.requestPermission().then(function (p) {
        if (p !== 'granted') { say('pushDenied', true); throw 0; }
        return Promise.all([loadMsg(), navigator.serviceWorker.ready]);
      }).then(function (r) {
        return firebase.messaging().getToken({ vapidKey: window.VAPID_KEY, serviceWorkerRegistration: r[1] });
      }).then(function (tok) {
        if (!tok) throw 1; track('push_subscribe');
        return db.ref('push').push({ token: tok, target: target, at: firebase.database.ServerValue.TIMESTAMP });
      }).then(function () { S.pushSent = (S.pushSent || 0) + 1; say('pushOk'); }).catch(function (e) { if (e !== 0) say('pushErr', true); }).then(function () { b.disabled = false; });
    });
  })();

  /* ---------- Avísame cuando abran ---------- */
  function normPhone(cc, raw) {
    var nat = String(raw || '').replace(/\D/g, '').replace(/^0+/, '');
    if (nat.indexOf(cc) === 0 && nat.length > cc.length + 6) nat = nat.slice(cc.length);
    else if (cc === '549' && nat.indexOf('54') === 0 && nat.length > 9) nat = nat.replace(/^549?/, '');
    return { nat: nat, phone: cc + nat, ok: nat.length >= 7 && nat.length <= 11 };
  }
  function notifyAdminOpen(phone) {
    var topic = window.NTFY_TOPIC; if (!topic || !ntfyOk('open')) return;
    try {
      fetch('https://ntfy.sh/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        topic: topic, title: 'Cliente espera que abras', message: 'Un cliente espera que abras. Abre el panel para ver quién.',
        priority: 3, tags: ['bell'], click: location.origin + location.pathname + '#admin' }) }).catch(function () {});
    } catch (e) {}
  }
  function nfSay(k, kind) { var m = $('#nfMsg'); m.textContent = t(k); m.className = 'nfmsg' + (kind ? ' ' + kind : ''); }
  $('#offNotifyBtn').addEventListener('click', function () {
    var f = $('#offNotifyForm'); f.hidden = !f.hidden; this.setAttribute('aria-expanded', f.hidden ? 'false' : 'true');
    if (!f.hidden) setTimeout(function () { $('#nfPhone').focus(); }, 60);
  });
  $('#nfPhone').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#nfSave').click(); });
  $('#nfSave').addEventListener('click', function () {
    var np = normPhone($('#nfCc').value, $('#nfPhone').value), btn = this;
    if (!np.ok || S.nfSent >= 3) { nfSay('nfBad', 'err'); return; }
    if (S.admin) { nfSay('nfPreview'); return; }
    if (!db) { nfSay('nfErr', 'err'); return; }
    btn.disabled = true;
    db.ref('notifyOpen').push({ phone: np.phone, at: firebase.database.ServerValue.TIMESTAMP }).then(function () {
      S.nfSent++; notifyAdminOpen(np.phone); nfSay('nfOk', 'ok'); $('#nfPhone').value = ''; $('#offNotifyForm').hidden = true; $('#offNotifyBtn').setAttribute('aria-expanded', 'false');
    }).catch(function () { nfSay('nfErr', 'err'); }).then(function () { btn.disabled = false; });
  });

  /* ---------- Reseñas ---------- */
  function revList(v) {
    v = v || {};
    return Object.keys(v).map(function (k) {
      var x = v[k] || {};
      return { id: k, name: String(x.name || ''), place: String(x.place || ''), text: String(x.text || ''), stars: Math.max(1, Math.min(5, Math.round(+x.stars || 5))), at: +x.at || 0 };
    }).filter(function (x) { return x.name && x.text; }).sort(function (a, b) { return b.at - a.at; });
  }
  function renderReviews() {
    var box = $('#revList'); if (!box) return; box.textContent = '';
    S.reviews.slice(0, 10).forEach(function (r) {
      var c = el('div', 'rev'), h = el('div', 'rh'), w = el('div', 'who'), st = el('div', 'st');
      c.setAttribute('role', 'listitem');
      h.appendChild(el('span', 'ini', r.name.trim().charAt(0).toUpperCase()));
      w.appendChild(el('b', null, r.name)); if (r.place) w.appendChild(el('small', null, r.place));
      h.appendChild(w); c.appendChild(h);
      st.setAttribute('aria-label', r.stars + ' de 5 estrellas');
      for (var i = 1; i <= 5; i++) st.appendChild(el('i', i <= r.stars ? null : 'dim', '★'));
      c.appendChild(st); c.appendChild(el('p', null, '“' + r.text + '”')); box.appendChild(c);
    });
    $('#revHint').hidden = S.reviews.length < 2;
    $('#revCard').hidden = isLocked() || !S.reviews.length;
  }

  /* ---------- Teclado abierto: la barra inferior se esconde para no tapar el formulario ---------- */
  var kbT = null;
  document.addEventListener('focusin', function (e) { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { clearTimeout(kbT); document.body.classList.add('kb'); } });
  document.addEventListener('focusout', function () { clearTimeout(kbT); kbT = setTimeout(function () { document.body.classList.remove('kb'); }, 150); });

  /* ---------- Hacer cambio (elige administrador) ---------- */
  function setSheet2(o) { $('#sheet2').classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; if (o) { $('#pick').scrollTop = 0; greetPick(); } else stopGreet(); }
  function dayKey(d) {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d || new Date()); }
    catch (e) { return (d || new Date()).toISOString().slice(0, 10); }
  }
  function countStart() {
    if (!db || S.admin || S.startedN >= 5) return; S.startedN++;
    try { db.ref('stats/' + dayKey() + '/started').transaction(function (v) { return (typeof v === 'number' ? v : 0) + 1; }).catch(function () {}); } catch (e) {}
  }
  var bumpN = {};
  function bump(f) {   // contador diario anónimo (copiados, WhatsApp Justo/Boris); máximo 12 por tipo y visita
    if (!db || S.admin || S.preview || (bumpN[f] = (bumpN[f] || 0) + 1) > 12) return;
    try { db.ref('stats/' + dayKey() + '/' + f).transaction(function (v) { return (typeof v === 'number' ? v : 0) + 1; }).catch(function () {}); } catch (e) {}
  }
  /* ---------- Analytics (opcional) y registro de consultas por WhatsApp ---------- */
  function track(name, params) { try { if (window.gtag && !S.admin) window.gtag('event', name, params || {}); } catch (e) {} }
  function initGA() {
    var id = window.GA_ID; if (!id || !/^G-[A-Z0-9]{4,}$/.test(id) || navigator.doNotTrack === '1' || location.hash === '#admin' || window.__gaOn) return; window.__gaOn = true;
    window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', id, { anonymize_ip: true, send_page_view: true });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(s);
  }
  var inqLast = {};
  function logInquiry(who) {
    track('whatsapp_click', { who: who, op: S.op });
    if (!db || S.admin || S.preview || !PHONES[who]) return;
    bump(who === 'justo' ? 'waJusto' : 'waBoris');
    var now = Date.now(); if (inqLast[who] && now - inqLast[who] < 60000) return; inqLast[who] = now;
    var k = S.lastCalc || {}, o = { who: who, at: firebase.database.ServerValue.TIMESTAMP, st: 'pending', op: String(S.op || 'cambio').slice(0, 12) };
    if (k.ok && isFinite(k.amt) && isFinite(k.rate)) { o.usd = Math.round(k.amt * 100) / 100; o.rate = Math.round(k.rate * 100) / 100; }
    try { db.ref('inquiries').push(o).catch(function () {}); } catch (e) {}
  }
  document.addEventListener('click', function (e) { var w = e.target.closest && e.target.closest('[data-wa]'); if (w) logInquiry(w.getAttribute('data-wa')); });
  setTimeout(initGA, 2500);

  function renderPickSummary() {
    var box = $('#pickSummaryText'); if (!box) return;
    var k = S.lastCalc || calc(), lines = [];
    if (S.dir === 'ars') {
      var pr = arsPair();
      if (pr.p > 0 && pr.u > 0) {
        lines.push('Entregas: ' + ars(pr.p));
        lines.push('Recibes aproximadamente: ' + usd(pr.u));
        lines.push('Cotización de referencia: ' + ars(S.cfg.rateSell) + ' por USD');
      } else lines.push('Cambio de pesos a dólares: consulta la cotización vigente por WhatsApp.');
    } else if (k.ok) {
      lines.push('Importe: ' + usd(k.amt));
      lines.push('Comisión: ' + usd(k.fee) + (S.mode === 'incluida' ? ' (incluida)' : ' (aparte)'));
      lines.push('Recibes aproximadamente: ' + ars(k.receive));
      lines.push('Cotización de referencia: ' + ars(k.rate) + ' por USD');
    } else lines.push('Completa un importe válido para ver el resumen.');
    box.textContent = lines.join(' · ') + ' · Precio sujeto a confirmación del administrador.';
  }
  function doChange() { track('hacer_cambio', { amount: Math.round(num(S.amount) || 0) }); doCopy(true); countStart(); renderPickSummary(); setSheet2(true); }
  $('#changeBtn').addEventListener('click', doChange);
  $('#stChange').addEventListener('click', doChange);
  $('#sheet2Close').addEventListener('click', function () { setSheet2(false); });
  $('#sheet2Bd').addEventListener('click', function () { setSheet2(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSheet2(false); });

  /* ---------- Pantalla de apagado (fuera de línea) ---------- */
  function arTime() {
    try { return new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); }
    catch (e) { var d = new Date(); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  }
  function offWanted() { return !!(fbOk && S.live && S.cfg.online === false && (!S.admin || S.preview)); }
  function setInert(o) { ['.wrap', '#sticky'].forEach(function (sel) { var n = $(sel); if (n) { if (o) n.setAttribute('inert', ''); else n.removeAttribute('inert'); } }); }
  function buildStars() {
    var st = $('#stars'); if (st.children.length) return;
    for (var i = 0; i < 48; i++) {
      var d = document.createElement('i'), z = 1 + Math.random() * 2;
      d.style.cssText = 'left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 62).toFixed(1) + '%;width:' + z.toFixed(1) + 'px;height:' + z.toFixed(1) + 'px;animation-delay:' + (Math.random() * 4).toFixed(2) + 's;animation-duration:' + (2 + Math.random() * 3).toFixed(2) + 's';
      st.appendChild(d);
    }
  }
  function showOff() {
    var ov = $('#off'); clearTimeout(S.offT);
    var was = !ov.hidden && !ov.classList.contains('boot');
    ov.classList.remove('boot'); if (was) return;
    ov.hidden = false; ov.classList.remove('show', 'instant');
    if (!S.splashDone) ov.classList.add('instant');
    void ov.offsetWidth; ov.classList.add('show');
    $('#offAdmin').hidden = true; $('#offMsg').textContent = '';
    setInert(true); document.body.style.overflow = 'hidden'; buildStars();
    try { if (navigator.vibrate && S.splashDone) navigator.vibrate(25); } catch (e) {}
  }
  function hideOff() {
    var ov = $('#off'); if (ov.hidden || ov.classList.contains('boot')) return;
    ov.classList.remove('instant'); ov.classList.add('boot'); setInert(false); document.body.style.overflow = '';
    clearTimeout(S.offT); S.offT = setTimeout(function () { ov.hidden = true; ov.classList.remove('show', 'boot', 'instant'); }, 1400);
  }
  var SCENES = ['noche', 'ciudad', 'atardecer', 'desierto'], EMB = { noche: '🌙', ciudad: '🌃', atardecer: '🌅', desierto: '🌵' };
  function sceneNow() {
    var q = /[?&]escena=(\w+)/.exec(location.search); if (q && SCENES.indexOf(q[1]) > -1) return q[1];
    if (S.sceneForce) return S.sceneForce;
    var h = Math.floor(arMinutes() / 60);
    return h >= 6 && h < 17 ? 'desierto' : h >= 17 && h < 20 ? 'atardecer' : h >= 20 ? 'ciudad' : 'noche';
  }
  function buildCity() {
    var box = $('#cityBox'); if (box.children.length) return;
    var W = 400, H = 200, svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">', seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    [['#1a1565', 0.62, 0], ['#0a0838', 1, 1]].forEach(function (L) {
      var x = -4; svg += '<g fill="' + L[0] + '">';
      while (x < W) {
        var w = 18 + rnd() * 26, h = (50 + rnd() * 100) * L[1]; svg += '<rect x="' + x.toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '"/>';
        if (L[2]) { for (var wy = H - h + 8; wy < H - 6; wy += 11) for (var wx = x + 4; wx < x + w - 5; wx += 8) if (rnd() > 0.55) svg += '<rect class="win" style="animation-delay:' + (rnd() * 4).toFixed(1) + 's" x="' + wx.toFixed(1) + '" y="' + wy.toFixed(1) + '" width="3.4" height="5" fill="' + (rnd() > 0.8 ? '#7be9ff' : '#FFD54A') + '"/>'; }
        x += w + 1 + rnd() * 3;
      }
      svg += '</g>';
    });
    box.innerHTML = svg + '</svg>';
  }
  function fmtDur(m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + r + ' min' : '') : r + ' min'; }
  function syncOff() {
    var want = offWanted();
    if (want) showOff(); else hideOff();
    if (want) {
      setText('#offTime', arTime());
      var c = S.cfg, hh = $('#offHours'), a = toMin(c.hoursFrom), b = toMin(c.hoursTo), ov = $('#off'), sc = sceneNow();
      if (ov.getAttribute('data-sc') !== sc) { ov.setAttribute('data-sc', sc); if (sc === 'ciudad') buildCity(); }
      setText('#offEmb', EMB[sc]); setText('#offH', t('offH_' + sc));
      var rsn = (c.offReason || '').trim(), rn = $('#offReason'); rn.hidden = !rsn; if (rsn) setText('#offReason', rsn);
      if (c.hoursOn && a != null && b != null) {
        var n = arMinutes(), open = a <= b ? (n >= a && n < b) : (n >= a || n < b);
        hh.hidden = false; setText('#offHours', open ? t('hoursInfo', { a: c.hoursFrom, b: c.hoursTo }) : '⏰ ' + t('opensIn', { x: fmtDur((a - n + 1440) % 1440) }) + ' · ' + c.hoursFrom);
      } else hh.hidden = true;
      $('#offBack').hidden = !S.admin; $('#offLock').hidden = S.admin; $('#offScene').hidden = !(S.admin && S.preview);
    }
  }
  function showOffAdmin() { $('#offAdmin').hidden = false; setTimeout(function () { $('#offPass').focus(); }, 60); }
  $('#offLock').addEventListener('click', showOffAdmin);
  $('#offBack').addEventListener('click', function () { S.preview = false; S.sceneForce = null; update(); });
  $('#offScene').addEventListener('click', function () { var cur = sceneNow(); S.sceneForce = SCENES[(SCENES.indexOf(cur) + 1) % SCENES.length]; update(); });

  /* ---------- panel de administrador ---------- */
  var gate = $('#gate'), slot = $('#adminSlot');
  $('#adminBack').addEventListener('click', function () { document.body.classList.remove('admin-client'); try { window.scrollTo(0, 0); } catch (e) {} });
  function openGate() { if (S.admin) return; if (fbOk) loadAuth().catch(function () {}); if (offWanted()) { showOffAdmin(); return; } gate.hidden = false; setTimeout(function () { gate.scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#pass').focus(); }, 60); }
  $('#lockBtn').addEventListener('click', openGate);
  if (location.hash === '#admin') setTimeout(openGate, 1700);
  window.addEventListener('hashchange', function () { if (location.hash === '#admin') openGate(); });
  function errMsg(e) {
    var c = (e && e.code) || '';
    if (/wrong-password|invalid-credential|user-not-found|invalid-login/.test(c)) return 'Clave incorrecta, o el usuario admin@dolarpesopro.app no existe en Firebase → Authentication → Usuarios.';
    if (/operation-not-allowed/.test(c)) return 'Falta activar Correo/contraseña en Firebase → Authentication → Método de acceso.';
    if (/unauthorized-domain/.test(c)) return 'Falta autorizar este dominio en Firebase → Authentication → Configuración.';
    if (/too-many/.test(c)) return 'Demasiados intentos. Espera unos minutos.';
    if (/network/.test(c)) return 'Sin conexión. Intenta de nuevo.';
    if (/PERMISSION_DENIED|permission/i.test((e && e.message) || '') || /permission/.test(c)) return 'Sin permiso. Vuelve a entrar con tu clave; si ya lo hiciste, falta publicar las reglas nuevas de Firebase (archivo firebase.rules.json).';
    return 'No se pudo completar (' + (c || 'error') + ').';
  }
  function login(ids) {
    ids = ids || { pass: '#pass', btn: '#passBtn', msg: '#gateMsg' };
    var gm = $(ids.msg), pw = $(ids.pass).value;
    if (!fbOk) { gm.textContent = 'Falta conectar Firebase (revisa el README).'; return; }
    if (!pw) { gm.textContent = 'Escribe la clave.'; return; }
    $(ids.btn).disabled = true; gm.textContent = '';
    loadAuth().then(function (a) { return a.signInWithEmailAndPassword(window.ADMIN_EMAIL, pw); }).then(function () { $(ids.pass).value = ''; resetEye($(ids.pass)); })
      .catch(function (e) { gm.textContent = errMsg(e); }).then(function () { $(ids.btn).disabled = false; });
  }
  var OFFIDS = { pass: '#offPass', btn: '#offPassBtn', msg: '#offMsg' };
  $('#passBtn').addEventListener('click', function () { login(); });
  $('#pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });
  $('#offPassBtn').addEventListener('click', function () { login(OFFIDS); });
  $('#offPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') login(OFFIDS); });

  var P = null;   // nodos del panel
  function pa(id) { return slot.querySelector('#' + id); }
  var aToastT = null;
  function msgA(txt, bad) {
    var m = pa('aMsg'); if (m) { m.textContent = txt; m.classList.toggle('msgerr', !!bad); }
    var tt = document.getElementById('aToast'); if (!tt) { tt = document.createElement('div'); tt.id = 'aToast'; tt.setAttribute('role', 'status'); tt.setAttribute('aria-live', 'polite'); document.body.appendChild(tt); }
    tt.textContent = txt; tt.className = 'atoast on' + (bad ? ' bad' : ''); clearTimeout(aToastT);
    if (!/^Guardando/.test(txt)) aToastT = setTimeout(function () { tt.className = 'atoast'; }, bad ? 12000 : 4500);
  }
  function mountPanel() {
    if (S.admin) return; S.admin = true; document.body.classList.add('admin-mode'); document.body.classList.remove('admin-client'); try { window.scrollTo(0, 0); } catch (e) {} if (window.GA_ID) window['ga-disable-' + window.GA_ID] = true; gate.hidden = true; update();
    slot.appendChild(document.getElementById('adminTpl').content.cloneNode(true));
    addEye(pa('aNewPass'));
    pa('aClient').addEventListener('click', function () { document.body.classList.add('admin-client'); try { window.scrollTo(0, 0); } catch (e) {} });
    ['aFrom', 'aTo'].forEach(function (id) { var sel = pa(id); for (var m = 0; m < 1440; m += 15) { var v = (m / 60 < 10 ? '0' : '') + Math.floor(m / 60) + ':' + (m % 60 < 10 ? '0' : '') + (m % 60), o = el('option', null, v); o.value = v; sel.appendChild(o); } });
    pa('aPeek').addEventListener('click', function () { S.preview = true; update(); });
    $$('input[inputmode="decimal"]', slot).forEach(function (i) { bindClean(i); i.addEventListener('input', function () { i.dataset.dirty = '1'; }); });
    ['aAnn', 'aFrom', 'aTo'].forEach(function (id) { ['input', 'change'].forEach(function (ev) { pa(id).addEventListener(ev, function (e) { e.target.dataset.dirty = '1'; }); }); });
    var st = pa('aSteps');
    [-10, -5, 5, 10].forEach(function (d) {
      var b = el('button', 'chip', (d > 0 ? '+' : '−') + Math.abs(d)); b.type = 'button';
      b.addEventListener('click', function () { var r = pa('aRate'); r.value = inN(Math.max(1, num(r.value) + d)); r.dataset.dirty = '1'; }); st.appendChild(b);
    });
    function run(p, ok, grp) {
      msgA('Guardando…');
      p.then(function () { (grp || []).forEach(function (id) { delete pa(id).dataset.dirty; }); msgA(ok + ' ✓ Ya está en vivo para los clientes.'); refreshPanel(); if (S.resync) S.resync(); })
        .catch(function (e) { msgA(errMsg(e), true); refreshPanel(); if (S.resync) S.resync(); });
    }
    pa('aPub').addEventListener('click', function () {
      var v = num(pa('aRate').value); if (!(v > 0)) { msgA('Escribe una cotización válida.', true); return; }
      var cur = S.cfg.rate, prev = cur !== v ? cur : S.cfg.prev, now = Date.now();
      var items = [{ rate: v, at: now }].concat(histList().map(function (x) { return { rate: x.rate, at: x.at || 0 }; })).slice(0, 20);
      msgA('Publicando…');
      db.ref().update({ 'config/rate': v, 'config/prev': prev, 'config/updatedAt': firebase.database.ServerValue.TIMESTAMP, 'history': items })
        .then(function () { return db.ref('config/rate').once('value'); })
        .then(function (s) { delete pa('aRate').dataset.dirty; var hits = S.alerts.filter(function (x) { return s.val() >= x.target; }).length; msgA('Publicada ✓ Confirmado en el servidor: ' + ars(s.val()) + '. Los clientes ya la ven.' + (hits ? ' 🔔 ' + hits + ' cliente(s) esperaban este precio: avísales en el punto 7.' : '')); refreshPanel(); })
        .catch(function (e) { msgA(errMsg(e), true); });
    });
    pa('aManual').addEventListener('click', function () { run(db.ref('config/allowManual').set(!S.cfg.allowManual), 'Permiso actualizado'); });
    pa('aMinBtn').addEventListener('click', function () {
      var mn = num(pa('aMin').value); if (mn > 100000) { msgA('Revisa el valor.', true); return; }
      run(db.ref('config/minUsd').set(mn), 'Mínimo guardado', ['aMin']);
    });
    var cfTimer = null;
    function hideConfirm() { clearTimeout(cfTimer); pa('aConfirm').hidden = true; }
    pa('aConfirmNo').addEventListener('click', hideConfirm);
    pa('aConfirmYes').addEventListener('click', function () { hideConfirm(); doEngine(false); });
    pa('aEngine').addEventListener('click', function () {
      if (S.master !== false) { var cf = pa('aConfirm'); if (cf.hidden) { var rr0 = pa('aReason').value.trim(); pa('aConfirmReason').textContent = rr0 ? 'Los clientes verán el motivo: «' + rr0 + '»' : 'Sin motivo. Si quieres, escríbelo abajo en “Motivo al apagar” antes de apagar.'; cf.hidden = false; clearTimeout(cfTimer); cfTimer = setTimeout(hideConfirm, 8000); cf.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } else hideConfirm(); return; }
      doEngine(true);
    });
    function doEngine(turnOn) {
      var btn = pa('aEngine');
      btn.classList.remove('crank'); void btn.offsetWidth; btn.classList.add('crank'); setTimeout(function () { btn.classList.remove('crank'); }, 650);
      try { if (navigator.vibrate) navigator.vibrate(turnOn ? [30, 40, 70] : 25); } catch (e) {}
      var wasAuto = autoOn(), upd = stMin({ mode: modeFor(turnOn, wasAuto) }), extra = '';
      if (!turnOn) { var rr = pa('aReason').value.trim().slice(0, 120); upd.offReason = rr || null; }
      else if (S.waiters.length) extra = ' · 🔔 ' + S.waiters.length + ' cliente(s) esperan tu aviso: mira el punto 8';
      pa('aEngineBox').classList.toggle('on', turnOn); pa('aEngine').setAttribute('aria-pressed', turnOn ? 'true' : 'false');
      var mp = { 'config/autoPref': wasAuto }; Object.keys(upd).forEach(function (k) { mp['status/' + k] = upd[k]; });
      run(db.ref().update(mp), (turnOn ? (wasAuto ? 'Encendido: ahora abre y cierra según el horario' : 'En línea') : 'Apagado general: nadie puede cotizar' + (wasAuto ? ' (el horario automático queda en pausa hasta que enciendas)' : '')) + extra, turnOn ? [] : ['aReason']);
    }
    pa('aSellBtn').addEventListener('click', function () {
      var v = num(pa('aSell').value); if (!(v > 0) || v > 100000) { msgA('Escribe una cotización válida (pesos por USD).', true); return; }
      run(db.ref('config/rateSell').set(v), 'Cotización pesos → dólares guardada', ['aSell']);
    });
    pa('aSellOff').addEventListener('click', function () { pa('aSell').value = ''; delete pa('aSell').dataset.dirty; run(db.ref('config/rateSell').remove(), 'Cotización pesos → dólares quitada'); });
    function bumpDone(d) { db.ref('stats/' + dayKey() + '/done').transaction(function (v) { return Math.max(0, (typeof v === 'number' ? v : 0) + d); }).catch(function (e) { msgA(errMsg(e), true); }); }
    pa('aStPlus').addEventListener('click', function () { bumpDone(1); });
    pa('aStMinus').addEventListener('click', function () { bumpDone(-1); });
    /* --- consultas por WhatsApp: confirmar si se dio o no --- */
    function twoStep(z, ask, fn) {   // el primer toque pide confirmar; el segundo ejecuta (se desarma solo a los 3 s)
      var o = z.textContent, tm; z.addEventListener('click', function () {
        if (z.dataset.arm) { clearTimeout(tm); delete z.dataset.arm; z.textContent = o; fn(); return; }
        z.dataset.arm = '1'; z.textContent = ask; tm = setTimeout(function () { delete z.dataset.arm; z.textContent = o; }, 3000);
      });
    }
    function inqDel(list) {
      if (!list.length) return; var m = {}; list.forEach(function (x) { m[x.id] = null; });
      db.ref('inquiries').update(m).then(function () { msgA(list.length + ' consulta(s) borrada(s) ✓'); }).catch(function (e) { msgA(errMsg(e), true); });
    }
    function inqRender() {
      var box = pa('aInqList'); if (!box) return; box.textContent = '';
      var all = S.inq || [], tab = S.inqTab || 'pend', max = S.inqMax || 15;
      var wk = all.filter(function (x) { return x.at >= srvNow() - 7 * 86400000; }), dn = wk.filter(function (x) { return x.st === 'done'; }).length, ls = wk.filter(function (x) { return x.st === 'lost'; }).length, pd = wk.length - dn - ls;
      var today = all.filter(function (x) { return dayKey(new Date(x.at)) === dayKey(new Date(srvNow())); }), td = today.filter(function (x) { return x.st === 'done'; }).length;
      pa('aInqSum').innerHTML = '<b>Hoy:</b> ' + today.length + ' consulta(s) · ' + td + ' concretada(s)<br><b>Últimos 7 días:</b> ' + wk.length + ' consultas · ' + dn + ' concretadas (' + (wk.length ? Math.round(dn / wk.length * 100) : 0) + '%) · ' + ls + ' no se dieron · ' + pd + ' pendientes';
      var by = { pend: all.filter(function (x) { return x.st !== 'done' && x.st !== 'lost'; }), done: all.filter(function (x) { return x.st === 'done'; }), lost: all.filter(function (x) { return x.st === 'lost'; }) };
      var tabs = pa('aInqTabs'); tabs.textContent = '';
      [['pend', 'Pendientes'], ['done', 'Se dieron'], ['lost', 'No']].forEach(function (d) {
        var z = el('button', tab === d[0] ? 'on' : null, d[1] + ' (' + by[d[0]].length + ')'); z.type = 'button'; z.setAttribute('aria-pressed', tab === d[0] ? 'true' : 'false');
        z.addEventListener('click', function () { S.inqTab = d[0]; S.inqMax = 15; inqRender(); }); tabs.appendChild(z);
      });
      var list = by[tab]; pa('aInqEmpty').hidden = list.length > 0;
      pa('aInqEmpty').textContent = tab === 'pend' ? (all.length ? 'No hay consultas pendientes. ✔' : 'Aún no hay consultas.') : 'No hay consultas en esta lista.';
      list.slice(0, max).forEach(function (x) {
        var who = x.who === 'boris' ? 'Boris 😎' : 'Justo 🤠', det = (typeof x.usd === 'number' ? fmtN(x.usd) + ' USD' : 'sin monto') + (typeof x.rate === 'number' ? ' · ' + ars(x.rate) : '') + ' · ' + relTime(x.at);
        var row = el('div', 'alrow' + (x.st === 'done' ? ' hit' : '')), info = el('div', 'nm', (x.st === 'done' ? '✔ ' : x.st === 'lost' ? '✖ ' : '⏳ ') + who + ' · ' + det), b = el('div', 'b');
        function btn(txt, st, css) { var z = el('button', null, txt); z.type = 'button'; z.style.cssText = css; z.addEventListener('click', function () { inqSet(x, st); }); b.appendChild(z); }
        if (x.st === 'pending') { btn('Se dio', 'done', 'background:#0F7A40;color:#fff'); btn('No', 'lost', 'background:var(--card);color:var(--ink);border:2px solid var(--fline)'); }
        else btn('Deshacer', 'pending', 'background:var(--card);color:var(--ink);border:2px solid var(--fline)');
        if (x.st === 'lost') {
          var follow = el('a', null, 'Volver a contactar');
          var fmsg = ['Hola, retomo tu consulta de Dólar PesoPro.'];
          if (typeof x.usd === 'number') fmsg.push('Importe consultado: ' + fmtN(x.usd) + ' USD.');
          if (typeof x.rate === 'number') fmsg.push('Cotización de referencia anterior: ' + ars(x.rate) + ' por USD.');
          fmsg.push('¿Quieres que te confirme la cotización actual?');
          follow.href = 'https://wa.me/' + PHONES[x.who === 'boris' ? 'boris' : 'justo'] + '?text=' + encodeURIComponent(fmsg.join('\n'));
          follow.target = '_blank'; follow.rel = 'noopener'; follow.style.cssText = "min-height:36px;padding:0 10px;border-radius:12px;background:#167044;color:#fff;font:700 12px 'Plus Jakarta Sans',sans-serif;text-decoration:none;display:flex;align-items:center;white-space:nowrap";
          follow.addEventListener('click', function () { track('inquiry_recontact', { who: x.who || 'justo' }); }); b.appendChild(follow);
        }
        var dz = el('button', null, '🗑'); dz.type = 'button'; dz.setAttribute('aria-label', 'Borrar esta consulta'); dz.style.cssText = 'background:var(--card);color:#C62828;border:2px solid var(--fline)'; twoStep(dz, '¿Borrar?', function () { inqDel([x]); }); b.appendChild(dz);
        row.appendChild(info); row.appendChild(b); box.appendChild(row);
      });
      if (list.length > max) { var mo = el('button', 'btn ghost', 'Ver más (' + (list.length - max) + ')'); mo.type = 'button'; mo.addEventListener('click', function () { S.inqMax = max + 15; inqRender(); }); box.appendChild(mo); }
      var act = pa('aInqAct'); act.textContent = '';
      if (by.lost.length) { var c1 = el('button', 'btn ghost', 'Borrar las “No” (' + by.lost.length + ')'); c1.type = 'button'; twoStep(c1, '¿Seguro? Toca otra vez', function () { inqDel(by.lost); }); act.appendChild(c1); }
      if (all.length) { var c2 = el('button', 'btn ghost', 'Borrar todo el registro (' + all.length + ')'); c2.type = 'button'; twoStep(c2, '¿Seguro? Toca otra vez', function () { inqDel(all); }); act.appendChild(c2); }
    }
    function inqSet(x, st) {
      db.ref('inquiries/' + x.id).update({ st: st, doneAt: st === 'done' ? firebase.database.ServerValue.TIMESTAMP : null }).then(function () {
        if (st === 'done' && x.st !== 'done') bumpDone(1); else if (x.st === 'done' && st !== 'done') bumpDone(-1);
      }).catch(function (e) { msgA(errMsg(e), true); });
    }
    S.inqRef = db.ref('inquiries').orderByKey().limitToLast(80);
    S.inqRef.on('value', function (s) {
      var v = s.val() || {}; S.inq = Object.keys(v).map(function (k) { var q = v[k] || {}; return { id: k, who: q.who, at: q.at || 0, st: q.st || 'pending', usd: q.usd, rate: q.rate, op: q.op }; }).sort(function (p, q) { return q.at - p.at; });
      S.rulesBad.inquiries = false; inqRender(); renderRules();
    }, function () { S.rulesBad.inquiries = true; renderRules(); });
    S.inqRender = inqRender;
    pa('aAuto').addEventListener('click', function () {
      var turnOn = !autoOn(), fa = toMin(S.cfg.hoursFrom), fb = toMin(S.cfg.hoursTo);
      if (turnOn && (fa == null || fb == null || fa === fb)) { msgA('Primero guarda el horario (punto 6) con dos horas distintas.', true); return; }
      var up2 = stMin({ mode: modeFor(S.master !== false, turnOn) }), mp2 = { 'config/autoPref': turnOn }; Object.keys(up2).forEach(function (k) { mp2['status/' + k] = up2[k]; });
      pa('aAuto').classList.toggle('on', turnOn); pa('aAuto').setAttribute('aria-checked', turnOn ? 'true' : 'false');
      run(db.ref().update(mp2), turnOn ? 'Encendido automático ACTIVADO: abre y cierra solo según el horario (mientras el botón principal esté encendido)' : 'Encendido automático DESACTIVADO: manda solo el botón principal');
    });
    function weekText() {
      var base = new Date(srvNow() - 10800000), lines = [], st = 0, dn = 0, pst = 0, pdn = 0, best = null, i;
      function key(n) { return new Date(base.getTime() - n * 86400000).toISOString().slice(0, 10); }
      function dm(k) { return k.slice(8) + '/' + k.slice(5, 7); }
      for (i = 6; i >= 0; i--) { var k = key(i), x = S.stats[k] || {}, a = x.started || 0, b = x.done || 0; st += a; dn += b; if (!best || b > best.b || (b === best.b && a > best.a)) best = { k: k, a: a, b: b }; lines.push(dm(k) + ': ' + a + ' iniciados · ' + b + ' concretados · ' + (x.copies || 0) + ' copiados · WA Justo ' + (x.waJusto || 0) + ' · WA Boris ' + (x.waBoris || 0)); }
      for (i = 7; i <= 13; i++) { var y = S.stats[key(i)] || {}; pst += y.started || 0; pdn += y.done || 0; }
      var rates = histList().filter(function (h) { return (h.at || 0) >= srvNow() - 7 * 86400000; }).map(function (h) { return h.rate; });
      function diff(n, p) { return p ? (n >= p ? '▲ +' : '▼ −') + Math.abs(Math.round((n - p) / p * 100)) + '% vs semana anterior' : 'sin semana anterior para comparar'; }
      var out = '📊 Resumen semanal · Dólar PesoPro\n' + lines.join('\n') + '\n\nTotal: ' + st + ' iniciados · ' + dn + ' concretados (' + (st ? Math.round(dn / st * 100) : 0) + '%)\nIniciados: ' + diff(st, pst) + '\nConcretados: ' + diff(dn, pdn);
      if (best && (best.a || best.b)) out += '\nMejor día: ' + dm(best.k) + ' (' + best.b + ' concretados)';
      if (rates.length) out += '\nCotización: mín ' + ars(Math.min.apply(null, rates)) + ' · máx ' + ars(Math.max.apply(null, rates)) + ' · ' + rates.length + ' cambio(s)';
      return out;
    }
    pa('aWeekBtn').addEventListener('click', function () {
      var bx = pa('aWeekBox'), open = bx.hidden; bx.hidden = !open; pa('aWeekAct').hidden = !open;
      if (open) bx.textContent = weekText();
    });
    pa('aWeekWa').addEventListener('click', function () { window.open('https://wa.me/?text=' + encodeURIComponent(weekText()), '_blank'); });
    pa('aWeekCopy').addEventListener('click', function () { var tx = weekText(); try { navigator.clipboard.writeText(tx).then(function () { msgA('Resumen copiado ✓'); }); } catch (e) { msgA('No se pudo copiar.', true); } });
    S.stRef = db.ref('stats').orderByKey().limitToLast(14); S.stRef.on('value', function (s) { S.stats = s.val() || {}; S.rulesBad.stats = false; renderStats(); renderRules(); }, function () { S.rulesBad.stats = true; renderRules(); });
    pa('aAnnBtn').addEventListener('click', function () { run(db.ref('config/announcement').set(pa('aAnn').value.trim().slice(0, 200)), 'Aviso guardado', ['aAnn']); });
    pa('aHoursOn').addEventListener('click', function () { var cur = S.cfg.hoursRaw !== undefined ? S.cfg.hoursRaw : S.cfg.hoursOn; pa('aHoursOn').classList.toggle('on', !cur); pa('aHoursOn').setAttribute('aria-checked', !cur ? 'true' : 'false'); run(db.ref('config/hoursOn').set(!cur), !cur ? 'Horario visible para los clientes' : 'Horario oculto (el automático, si está activo, sigue funcionando)'); });
    pa('aHoursBtn').addEventListener('click', function () {
      var from = pa('aFrom').value, to = pa('aTo').value;
      if (toMin(from) == null || toMin(to) == null) { msgA('Elige las dos horas.', true); return; }
      if (from === to) { msgA('Las dos horas no pueden ser iguales.', true); return; }
      var hu = { 'config/hoursFrom': from, 'config/hoursTo': to }, so = stFull({ hoursFrom: from, hoursTo: to });
      Object.keys(so).forEach(function (k) { hu['status/' + k] = so[k]; });
      msgA('Guardando…');
      db.ref().update(hu).then(function () { return db.ref('status').once('value'); }).then(function (s) {
        var v = s.val() || {};
        if (v.hoursFrom === from && v.hoursTo === to) { delete pa('aFrom').dataset.dirty; delete pa('aTo').dataset.dirty; msgA('Horario guardado ✓ Confirmado en el servidor: de ' + from + ' a ' + to + ' (hora de Argentina).'); }
        else msgA('El servidor devolvió ' + (v.hoursFrom || '?') + ' a ' + (v.hoursTo || '?') + ' en vez de ' + from + ' a ' + to + '. Avísame y lo revisamos.', true);
        refreshPanel();
      }).catch(function (e) { msgA(errMsg(e), true); });
    });
    pa('aPassBtn').addEventListener('click', function () {
      var np = pa('aNewPass').value; if (np.length < 10) { msgA('La clave debe tener al menos 10 caracteres.', true); return; }
      msgA('Guardando…');
      auth.currentUser.updatePassword(np).then(function () { pa('aNewPass').value = ''; pa('aNewPass').type = 'password'; passHint(); msgA('Clave cambiada ✓ Úsala la próxima vez. Guárdala en un lugar seguro.'); })
        .catch(function (e) { msgA(/recent/.test(e.code || '') ? 'Sal y vuelve a entrar, luego repite.' : errMsg(e), true); });
    });
    pa('aOut').addEventListener('click', function () { auth.signOut(); });
    S.alRef = db.ref('alerts'); S.alRef.on('value', function (s) {
      var v = s.val() || {}; S.alerts = Object.keys(v).map(function (k) { return { id: k, phone: v[k].phone, target: v[k].target, at: v[k].at }; }); S.rulesBad.alerts = false; renderAlerts(); renderRules();
    }, function () { S.rulesBad.alerts = true; renderRules(); });
    /* --- motivo al apagar --- */
    ['Volvemos a las 9:00', 'Feriado', 'Descanso', 'Actualizando cotización', 'Volvemos en 1 hora'].forEach(function (r) {
      var b = el('button', 'chip', r); b.type = 'button';
      b.addEventListener('click', function () { var i = pa('aReason'); i.value = r; i.dataset.dirty = '1'; i.focus(); });
      pa('aReasonChips').appendChild(b);
    });
    pa('aReason').addEventListener('input', function (e) { e.target.dataset.dirty = '1'; });
    pa('aReasonBtn').addEventListener('click', function () {
      var v = pa('aReason').value.trim().slice(0, 120);
      run(db.ref('status').update(stFull({ offReason: v })), v ? 'Motivo guardado' : 'Motivo quitado', ['aReason']);
    });
    /* --- compartir cotización por WhatsApp --- */
    pa('aShareRate').addEventListener('click', function () {
      var c = S.cfg, url = location.href.split('#')[0].split('?')[0];
      var txt = '💵 Dólar hoy en Dólar PesoPro: ' + ars(c.rate) + ' por USD' + (c.rateSell > 0 ? '\n🔁 Pesos → dólares: ' + ars(c.rateSell) : '') + '\nCalcula tu envío aquí: ' + url;
      window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
    });
    /* --- clientes que esperan que abramos --- */
    S.noRef = db.ref('notifyOpen'); S.noRef.on('value', function (s) {
      var v = s.val() || {}, map = {};
      Object.keys(v).forEach(function (k) { var x = v[k] || {}, ph = String(x.phone || ''); if (!ph) return; var m = map[ph] || (map[ph] = { phone: ph, at: x.at || 0, ids: [] }); m.ids.push(k); if ((x.at || 0) < m.at) m.at = x.at || 0; });
      S.waiters = Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return a.at - b.at; });
      S.rulesBad.notifyOpen = false; renderWaiters(); renderRules();
    }, function () { S.rulesBad.notifyOpen = true; renderRules(); });
    pa('aWaitersClear').addEventListener('click', function () {
      var u = {}; S.waiters.forEach(function (w) { w.ids.forEach(function (id) { u[id] = null; }); });
      db.ref('notifyOpen').update(u).catch(function (e) { msgA(errMsg(e), true); });
    });
    /* --- reseñas --- */
    var sp = pa('aRvStars');
    for (var si = 1; si <= 5; si++) (function (n) {
      var b = el('button', null, '★'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', n + (n === 1 ? ' estrella' : ' estrellas'));
      b.addEventListener('click', function () { S.rvStars = n; paintRvStars(); }); sp.appendChild(b);
    })(si);
    function paintRvStars() { Array.prototype.forEach.call(sp.children, function (b, i) { b.classList.toggle('on', i < S.rvStars); b.setAttribute('aria-checked', i + 1 === S.rvStars ? 'true' : 'false'); }); }
    paintRvStars();
    pa('aRvAdd').addEventListener('click', function () {
      var name = pa('aRvName').value.trim(), place = pa('aRvPlace').value.trim(), text = pa('aRvText').value.trim();
      if (!name || !text) { msgA('Escribe el nombre y la opinión del cliente.', true); return; }
      var o = { name: name.slice(0, 40), text: text.slice(0, 300), stars: S.rvStars, at: firebase.database.ServerValue.TIMESTAMP }; if (place) o.place = place.slice(0, 40);
      msgA('Publicando…');
      db.ref('reviews').push(o).then(function () {
        ['aRvName', 'aRvPlace', 'aRvText'].forEach(function (id) { pa(id).value = ''; }); S.rvStars = 5; paintRvStars(); msgA('Reseña publicada ✓ Ya la ven los clientes.');
      }).catch(function (e) { msgA(errMsg(e), true); });
    });
    /* --- clave: ayuda y generador --- */
    function passHint() {
      var n = pa('aNewPass').value.length;
      pa('aPassHint').textContent = n === 0 ? 'Usa 14 o más caracteres. Evita fechas, nombres y “pro123”.' : n < 10 ? 'Muy corta: faltan ' + (10 - n) + ' caracteres.' : n < 14 ? 'Aceptable. Mejor si llega a 14 o más.' : 'Buena clave ✓';
    }
    S.passHint = passHint;
    pa('aNewPass').addEventListener('input', passHint); passHint();
    pa('aGen').addEventListener('click', function () {
      var al = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789', a = new Uint32Array(16), out = '';
      (window.crypto || window.msCrypto).getRandomValues(a);
      for (var i = 0; i < 16; i++) { out += al.charAt(a[i] % al.length); if (i % 4 === 3 && i < 15) out += '-'; }
      pa('aNewPass').type = 'text'; pa('aNewPass').value = out; passHint();
      msgA('Clave generada. Cópiala y guárdala en un lugar seguro ANTES de tocar “Cambiar clave”.');
    });
    refreshPanel();
    setTimeout(function () { slot.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }
  function unmountPanel() {
    if (!S.admin) return; S.admin = false; S.preview = false; document.body.classList.remove('admin-mode', 'admin-client'); try { window.scrollTo(0, 0); } catch (e) {} update();
    if (S.alRef) { S.alRef.off(); S.alRef = null; }
    if (S.stRef) { S.stRef.off(); S.stRef = null; }
    if (S.noRef) { S.noRef.off(); S.noRef = null; }
    if (S.inqRef) { S.inqRef.off(); S.inqRef = null; } S.inq = [];
    var tt0 = document.getElementById('aToast'); if (tt0) tt0.className = 'atoast';
    S.waiters = [];
    slot.textContent = '';
  }
  function refreshSwitches() {
    var c = S.cfg, mst = S.master !== false, au = autoOn(), hs = c.hoursRaw !== undefined ? c.hoursRaw : c.hoursOn;
    pa('aEngineBox').classList.toggle('on', mst); pa('aEngine').setAttribute('aria-pressed', mst ? 'true' : 'false');
    pa('aAuto').classList.toggle('on', au); pa('aAuto').setAttribute('aria-checked', au ? 'true' : 'false');
    pa('aHoursOn').classList.toggle('on', !!hs); pa('aHoursOn').setAttribute('aria-checked', hs ? 'true' : 'false');
    pa('aManual').classList.toggle('on', !!c.allowManual); pa('aManual').setAttribute('aria-checked', c.allowManual ? 'true' : 'false');
  }
  function refreshPanel() {
    if (!S.admin || !pa('aRate')) return;
    try { refreshSwitches(); } catch (e) { console.error(e); }
    try { refreshPanelFull(); } catch (e) { console.error(e); msgA('Error interno al redibujar el panel: ' + (e && e.message ? e.message : e) + ' · avísame con este texto.', true); }
  }
  function refreshPanelFull() {
    if (!S.admin || !pa('aRate')) return; renderThemes(); var c = S.cfg;
    function fill(id, v) { var n = pa(id); if (n && !n.dataset.dirty && document.activeElement !== n) n.value = v; }
    fill('aRate', inN(c.rate)); fill('aMin', inN(c.minUsd)); fill('aSell', c.rateSell > 0 ? inN(c.rateSell) : '');
    fill('aAnn', c.announcement); fill('aFrom', c.hoursFrom); fill('aTo', c.hoursTo); fill('aReason', c.offReason);
    pa('aManual').classList.toggle('on', c.allowManual); pa('aHoursOn').classList.toggle('on', c.hoursRaw !== undefined ? c.hoursRaw : c.hoursOn);
    pa('aManual').setAttribute('aria-checked', c.allowManual ? 'true' : 'false'); pa('aHoursOn').setAttribute('aria-checked', (c.hoursRaw !== undefined ? c.hoursRaw : c.hoursOn) ? 'true' : 'false');
    pa('aManualHelp').textContent = c.allowManual ? 'Activado: cada cliente puede ajustar la cotización en su propio cálculo.' : 'Desactivado: los clientes solo ven la cotización oficial.';
    var on = c.online, mst = S.master !== false; pa('aEngineBox').classList.toggle('on', mst); pa('aEngine').setAttribute('aria-pressed', mst ? 'true' : 'false');
    pa('aEngineTitle').textContent = !mst ? 'FUERA DE LÍNEA' : on ? 'EN LÍNEA' : 'ENCENDIDO · CERRADO POR HORARIO'; pa('aPeek').hidden = on;
    pa('aEngineSub').textContent = !mst ? 'Apagado general: los clientes ven la pantalla de descanso. Tú sigues viendo todo normal. Toca el botón para encender.' : on ? 'Los clientes pueden cotizar y escribirte. Toca el botón para apagar todo.' : 'El botón está encendido, pero ahora cierra el horario automático (abres a las ' + c.hoursFrom + '). Toca el botón para apagar todo.';
    pa('aLive').innerHTML = '<b>Lo que ven los clientes ahora</b><br>Cotización: <b>' + (on ? ars(c.rate) : 'oculta (fuera de línea)') + '</b>' + (c.rateSell > 0 ? ' · Pesos → dólares: <b>' + ars(c.rateSell) + '</b>' : '') + '<br>Mínimo para calcular: <b>' + fmtN(c.minUsd) + ' USD</b> · Cambio manual: <b>' + (c.allowManual ? 'permitido' : 'bloqueado') + '</b><br>Conexión: <b>' + (S.online ? 'en vivo' : 'sin conexión') + '</b>';
    var au = autoOn(); pa('aAuto').classList.toggle('on', au); pa('aAuto').setAttribute('aria-checked', au ? 'true' : 'false');
    pa('aAutoHelp').textContent = au ? (mst ? 'Activo: abre a las ' + c.hoursFrom + ' y cierra a las ' + c.hoursTo + ' (hora de Argentina). El botón principal siempre puede apagar todo.' : 'Activo pero en pausa: el botón principal está apagado, así que no abre hasta que lo enciendas.') : 'Desactivado: abre y cierra solo cuando tú lo decides con el botón principal. Actívalo para usar el horario del punto 6.';
    renderAlerts(); renderWaiters(); renderRvAdmin(); renderRules();
  }
  function esc(x) { return String(x).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function renderRules() {
    if (!S.admin || !pa('aRules')) return;
    var bad = Object.keys(S.rulesBad).filter(function (k) { return S.rulesBad[k]; }), parts = [], box = pa('aRules');
    if (VERBAD.length) parts.push('<b>⚠ Archivos con versión distinta:</b> ' + esc(VERBAD.join(', ')) + '. Sube TODOS los archivos juntos a GitHub y recarga la página (en el celular, ciérrala y vuelve a abrirla).');
    if (bad.length) parts.push('<b>⚠ Falta publicar las reglas nuevas</b> (' + esc(bad.join(', ')) + '): Firebase → Realtime Database → Reglas → pega el contenido de firebase.rules.json → Publicar.');
    if (window.NTFY_TOPIC) parts.push('<b>⚠ El tema de ntfy está escrito en firebase-config.js</b>, que es público: cualquiera puede mandarte avisos falsos. Pásalo a la función de Firebase (PASO 4 del LEEME) y deja NTFY_TOPIC vacío.');
    try { var og = document.querySelector('link[rel=canonical]'); if (og && /TU-USUARIO/.test(og.href)) parts.push('<b>⚠ Falta poner tu dirección real</b> en index.html, halloween.html, robots.txt y sitemap.xml (busca TU-USUARIO.github.io): sin eso WhatsApp no muestra la imagen al compartir.'); } catch (e) {}
    if (!parts.length) parts.push('✔ <b>Todo al día:</b> los archivos tienen la misma versión y las reglas de Firebase responden.');
    box.innerHTML = parts.join('<br>'); box.hidden = false;
  }
  function renderWaiters() {
    if (!S.admin || !pa('aWaiters')) return; var box = pa('aWaiters'); box.textContent = '';
    pa('aWaitersEmpty').hidden = S.waiters.length > 0; pa('aWaitersClear').hidden = S.waiters.length < 2;
    var url = location.href.split('#')[0].split('?')[0];
    S.waiters.forEach(function (w) {
      var row = el('div', 'alrow'), info = el('div', 'nm', '+' + w.phone + (w.at ? ' · ' + relTime(w.at) : '')), b = el('div', 'b'), a = el('a', null, 'Avisar');
      a.style.cssText = 'background:#0F7A40;color:#fff'; a.target = '_blank'; a.rel = 'noopener';
      a.href = 'https://wa.me/' + w.phone + '?text=' + encodeURIComponent('¡Hola! Ya estamos en línea en Dólar PesoPro 🟢 El dólar está en ' + ars(S.cfg.rate) + '. ¿Quieres cambiar ahora? ' + url);
      var x = el('button', null, 'Listo'); x.type = 'button'; x.style.cssText = 'background:var(--card);color:var(--ink);border:2px solid var(--fline)';
      x.addEventListener('click', function () { var u = {}; w.ids.forEach(function (id) { u[id] = null; }); db.ref('notifyOpen').update(u).catch(function (e) { msgA(errMsg(e), true); }); });
      b.appendChild(a); b.appendChild(x); row.appendChild(info); row.appendChild(b); box.appendChild(row);
    });
  }
  function renderRvAdmin() {
    if (!S.admin || !pa('aRvList')) return; var box = pa('aRvList'); box.textContent = ''; pa('aRvEmpty').hidden = S.reviews.length > 0;
    S.reviews.forEach(function (r) {
      var row = el('div', 'alrow'), info = el('div', 'nm', '★'.repeat(r.stars) + ' · ' + r.name + (r.place ? ' (' + r.place + ')' : '') + ': “' + (r.text.length > 70 ? r.text.slice(0, 70) + '…' : r.text) + '”'), b = el('div', 'b');
      var x = el('button', null, 'Borrar'); x.type = 'button'; x.style.cssText = 'background:var(--card);color:var(--ink);border:2px solid var(--fline)';
      x.addEventListener('click', function () { db.ref('reviews/' + r.id).remove().catch(function (e) { msgA(errMsg(e), true); }); });
      b.appendChild(x); row.appendChild(info); row.appendChild(b); box.appendChild(row);
    });
  }
  function renderStats() {
    if (!S.admin || !pa('aStStarted')) return;
    var today = S.stats[dayKey()] || {}, st = 0, dn = 0, days = Object.keys(S.stats);
    pa('aStStarted').textContent = today.started || 0; pa('aStDone').textContent = today.done || 0;
    days.forEach(function (k) { st += S.stats[k].started || 0; dn += S.stats[k].done || 0; });
    var cd = pa('aStCards'); if (cd) cd.textContent = today.cards || 0;
    var cp = pa('aStCopies'), wj = pa('aStWaJ'), wb = pa('aStWaB'); if (cp) { cp.textContent = today.copies || 0; wj.textContent = today.waJusto || 0; wb.textContent = today.waBoris || 0; }
    var tc = 0, tj = 0, tb = 0; days.forEach(function (k) { tc += S.stats[k].copies || 0; tj += S.stats[k].waJusto || 0; tb += S.stats[k].waBoris || 0; });
    pa('aStWeek').textContent = 'Últimos ' + Math.max(1, days.length) + ' día(s) con actividad: ' + st + ' iniciados · ' + dn + ' concretados. “Iniciados” cuenta los toques en Hacer cambio. Copiados: ' + tc + ' · WhatsApp Justo: ' + tj + ' · WhatsApp Boris: ' + tb + '.';
  }
  function renderAlerts() {
    if (!S.admin || !pa('aAlerts')) return; var box = pa('aAlerts'); box.textContent = '';
    var list = S.alerts.slice().sort(function (a, b) { var ha = S.cfg.rate >= a.target, hb = S.cfg.rate >= b.target; return ha === hb ? (b.at || 0) - (a.at || 0) : (ha ? -1 : 1); });
    pa('aAlertsEmpty').hidden = list.length > 0;
    list.forEach(function (a) {
      var hit = S.cfg.rate >= a.target, row = el('div', 'alrow' + (hit ? ' hit' : '')), info = el('div', null, '+' + a.phone + ' · pide ' + ars(a.target) + (hit ? ' ✔ alcanzada' : ''));
      var b = el('div', 'b'), w = el('a', null, 'Avisar'); w.style.cssText = 'background:#0F7A40;color:#fff'; w.target = '_blank'; w.rel = 'noopener';
      w.href = 'https://wa.me/' + a.phone + '?text=' + encodeURIComponent('¡Hola! El dólar ya está en ' + ars(S.cfg.rate) + ' en Dólar PesoPro, como pediste (' + ars(a.target) + '). ¿Quieres cambiar ahora?');
      var x = el('button', null, 'Borrar'); x.type = 'button'; x.style.cssText = 'background:var(--card);color:var(--ink);border:2px solid var(--fline)';
      x.addEventListener('click', function () { db.ref('alerts/' + a.id).remove().catch(function (e) { msgA(errMsg(e), true); }); });
      b.appendChild(w); b.appendChild(x); row.appendChild(info); row.appendChild(b); box.appendChild(row);
    });
  }

  /* ---------- aviso discreto de cambio de cotización ---------- */
  var toastT = null;
  function relTime(ts) {
    if (!ts) return ''; var s = Math.round((Date.now() - ts) / 1000);
    try { var f = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
      if (s < 3600) return f.format(-Math.max(1, Math.round(s / 60)), 'minute');
      if (s < 86400) return f.format(-Math.round(s / 3600), 'hour'); return f.format(-Math.round(s / 86400), 'day'); } catch (e) { return ''; }
  }
  function showToast(up, text) {
    var tt = $('#toast'); tt.textContent = '';
    var a = el('span', 'ar ' + (up ? 'up' : 'dn'), up ? '▲' : '▼'); tt.appendChild(a); tt.appendChild(el('span', null, text));
    tt.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { tt.classList.remove('show'); }, 5000);
  }
  $('#toast').addEventListener('click', function () { this.classList.remove('show'); });
  function maybeInitialToast() {
    if (S.toastShown || !S.splashDone || !S.live || isLocked() || S.introPlaying) return; S.toastShown = true;
    var c = S.cfg; if (!(c.prev > 0) || c.prev === c.rate) return;
    var up = c.rate > c.prev, w = relTime(c.updatedAt);
    showToast(up, 'El dólar ' + (up ? 'subió' : 'bajó') + ' ' + fmtN(Math.abs(c.rate - c.prev)) + ' pesos' + (w ? ' · ' + w : ''));
  }
  function liveToast(old) {
    if (isLocked()) return;
    var up = S.cfg.rate > old; showToast(up, 'Cotización actualizada: ' + (up ? '+' : '−') + fmtN(Math.abs(S.cfg.rate - old)) + ' → ' + ars(S.cfg.rate));
  }

  /* ---------- arranque ---------- */
  /* sensación de toque: iOS necesita un listener táctil para activar :active; ondas + vibración corta */
  document.addEventListener('touchstart', function () {}, { passive: true });
  document.addEventListener('pointerdown', function (e) {
    var t = e.target.closest && e.target.closest('.btn,.chip,.qbtn,.closebtn,.themebtn,.stcopy,.go,.adm,summary,.linkbtn');
    if (!t || t.disabled || t.getAttribute('aria-disabled') === 'true') return;
    try { if (navigator.vibrate && e.pointerType !== 'mouse') navigator.vibrate(8); } catch (x) {}
    if (!t.matches('.btn,.chip,.qbtn,.closebtn,.stcopy')) return;
    var r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span');
    s.className = 'rip'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    t.appendChild(s); setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 600);
  }, { passive: true });
  addEye($('#pass')); addEye($('#offPass'));
  applySeason();
  applyStatic(); update();
  setTimeout(update, 9500);
  var rb = $('#sbRetry'); if (rb) rb.addEventListener('click', function () { S.t0 = Date.now(); if (S.resync) S.resync(); syncData(); update(); setTimeout(update, 9500); });
  var tf = $('#topFoot'); if (tf) tf.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  function tick() { if (S.denied && !S.admin) S.denied = false; applyStatus(); syncData(); update(); }
  setInterval(tick, 15000);
  /* ---------- App instalable (Android/Chrome: botón directo; iPhone: instrucciones) ---------- */
  (function () {
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone, ev = null, ios = /iphone|ipad|ipod/i.test(navigator.userAgent), foot = $('.socials');
    if (standalone || !foot) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'instbtn'; b.textContent = '📲 Instalar app'; b.hidden = true; foot.parentNode.insertBefore(b, foot.nextSibling);
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); ev = e; b.hidden = false; });
    if (ios) b.hidden = false;
    window.addEventListener('appinstalled', function () { b.hidden = true; });
    b.addEventListener('click', function () {
      if (ev) { ev.prompt(); ev.userChoice.then(function () { ev = null; b.hidden = true; }); }
      else copyToast('En Safari: toca Compartir ⬆️ y "Agregar a pantalla de inicio"');
    });
  })();
  setInterval(function () { if (S.resync) S.resync(); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { if (S.resync) S.resync(); tick(); } });
  window.addEventListener('pageshow', function () { if (S.resync) S.resync(); tick(); });
  window.addEventListener('online', function () { if (S.resync) S.resync(); });
  setTimeout(function () { S.splashDone = true; $('#splash').classList.add('hide'); update(); setTimeout(maybeInitialToast, 500); }, 1500);
})();
