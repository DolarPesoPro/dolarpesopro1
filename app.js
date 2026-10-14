/* Dólar PesoPro · calculadora en tiempo real (Firebase Realtime Database)
   - Nada se guarda en el dispositivo del cliente: todo vive en el servidor.
   - Sin Firebase configurado funciona en modo demostración con valores por defecto. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var PHONES = { justo: '5492216960939', boris: '5492216976823' };
  var DEFAULTS = { rate: 1580, prev: 0, updatedAt: 0, allowManual: true, feeFixed: 1.5, feeThreshold: 60, feePct: 2.5,
    minUsd: 3, announcement: '', hoursOn: false, hoursFrom: '09:00', hoursTo: '22:00' };

  /* ---------- textos ---------- */
  var I18N = {
    es: {
      loading: 'Cargando cotización…', tagline: 'CAMBIOS DE DIVISAS · ECUADOR A ARGENTINA', rateToday: 'DÓLAR HOY',
      calcTitle: 'Calcula tu envío', dirUsd: 'Dólares → Pesos', dirArs: 'Pesos → Dólares',
      amountLbl: 'Monto a enviar (USD)', rateLbl: 'Cotización (pesos por USD)', feeLbl: 'Comisión',
      feeIncl: 'Incluida en el monto', feeApart: 'Aparte del monto',
      enterAmount: 'Ingresa cuántos dólares quieres enviar para ver cuánto recibirás en pesos.',
      noFee: 'No se cobra comisión',
      arsText: 'Para cambiar de pesos a dólares, escríbele directamente a un administrador. La cotización se acuerda en el momento.',
      chatWa: 'Chatear por WhatsApp', guideTitle: 'Guía de uso', guideSub: 'Todo lo que necesitas saber para cambiar con Dólar PesoPro.',
      gHow: 'Cómo funciona', gQuick: 'Guía rápida', gFaq: 'Preguntas',
      speedTitle: 'Agiliza tu operación', speedSub: 'Datos opcionales: el mensaje de abajo se arma solo y lo copias con un toque.',
      addData: 'Agregar mis datos (opcional)', holder: 'Nombre completo del titular', holderPh: 'Como figura en tu cuenta', bank: 'Banco o billetera virtual donde recibes',
      bankPh: 'Tu banco de preferencia o billetera virtual', alias: 'Alias, CBU o CVU', aliasPh: 'Tu alias o número de cuenta',
      aliasWarn: 'Por favor, asegúrate de que tu alias o CBU esté bien escrito antes de enviar el mensaje.',
      msgTitle: 'Mensaje listo para copiar', msgSub: 'Pégalo en el chat de Justo o Boris. Ya incluye tu monto y tus datos.',
      copy: 'Copiar mensaje', copied: 'Mensaje copiado',
      talkTitle: 'Habla con un administrador', talkSub: 'Abre el chat de WhatsApp con tu mensaje ya escrito. Solo administradores verificados.',
      chk1: 'Administradores verificados. Opera solo con Justo y Boris.', chk2: 'Directo a tu cuenta, en tu banco de preferencia o billetera virtual.', chk3: 'Precio congelado 10 minutos al confirmar.',
      alertTitle: 'Avísame cuando suba', alertSub: 'Dinos a qué cotización quieres cambiar y te escribimos por WhatsApp cuando llegue.',
      alertTarget: 'Cotización objetivo (pesos por USD)', alertPhone: 'Tu WhatsApp (con código de país)', alertBtn: 'Avisarme',
      alertPriv: 'Solo usaremos tu número para este aviso.', alertOk: '¡Listo! Te avisaremos por WhatsApp.',
      alertBad: 'Revisa la cotización y tu número de WhatsApp.', alertErr: 'No se pudo guardar. Intenta de nuevo.',
      shareTitle: 'Comparte y únete', shareSub: 'Recomienda Dólar PesoPro y entra al grupo para ver las novedades.', shareBtn: 'Compartir con un amigo',
      shareText: 'Cambia dólares a pesos entre Ecuador y Argentina con Dólar PesoPro. Cotiza aquí:',
      group: 'Grupo de WhatsApp', groupSub: 'Escanea el QR o toca el botón para unirte.', join: 'Unirme al grupo', follow: 'Seguirnos en Instagram',
      instTitle: 'Ten la app en tu celular', instBtn: 'Instalar app',
      instAndroid: 'Toca el menú ⋮ de Chrome y elige “Instalar app” o “Añadir a pantalla de inicio”.',
      instIos: 'En Safari toca el botón Compartir y elige “Agregar a inicio”.',
      histTitle: 'Historial de cotización', histEmpty: 'Aquí aparecerán las últimas cotizaciones publicadas.',
      brandTag: 'NUESTRA MARCA', brandH: '¡Conviértete mejor, ahorra más!',
      brandP: 'Dólar PesoPro conecta Ecuador y Argentina con cambios de divisas rápidos, claros y con administradores verificados.',
      brandAdm: 'tus administradores verificados', copyright: '© 2026 Dólar PesoPro. Todos los derechos reservados.',
      disclaimer: 'Aviso importante: los valores mostrados son una simulación referencial calculada con la cotización indicada y pueden cambiar sin previo aviso. Una operación solo se considera válida cuando es confirmada por un administrador verificado (Justo o Boris); en ese momento se congela el precio por 10 minutos. Verifica siempre los datos de la cuenta antes de enviar dinero. Este contenido es informativo y no constituye asesoramiento financiero.',
      wJusto: 'Justo 🤠', wBoris: 'Boris 😎',
      recv: 'Recibirás en Argentina', rAmt: 'Monto', rFee: 'Comisión', rPay: 'Total a pagar', rRate: 'Cotización',
      freeze: 'El precio se congela 10 minutos al confirmar con un administrador. Actúa rápido o se actualiza.',
      stRecv: 'Recibirás', stHelp: 'Habla con un administrador',
      helpManual: 'Cotización oficial: {r}. Puedes ajustarla si necesitas calcular con otro valor.',
      helpFixed: 'Esta cotización está fijada por el administrador.', reset: 'Volver a la cotización oficial ({r})',
      modeIncl: 'Envías el monto exacto: la comisión ya está incluida en el cálculo.',
      modeApart: 'Recibes el monto completo en pesos: la comisión se suma al total a pagar.',
      feeFixedLbl: '{n} USD fijos', feePctLbl: '{n}%',
      liveOn: 'EN VIVO', liveOff: 'SIN CONEXIÓN', liveDemo: 'DEMOSTRACIÓN', upd: 'Pesos por cada dólar · Act. {d}', updNone: 'Pesos por cada dólar',
      open: 'Atendiendo ahora · {a}–{b}', closed: 'Fuera de horario · {a}–{b} (Argentina)',
      s1t: 'Cotiza', s1d: 'Ingresa el monto en dólares y mira al instante cuánto recibirás en pesos.',
      s2t: 'Copia tu mensaje', s2d: 'Completa tus datos (opcional), copia el mensaje listo o abre el chat con Justo o Boris.',
      s3t: 'Confirma', s3d: 'El administrador confirma el precio, lo congela 10 minutos y te indica a qué cuenta enviar.',
      s4t: 'Recibe', s4d: 'Envía tu transferencia, manda el comprobante y recibe tus pesos en tu banco de preferencia o billetera virtual.',
      q1t: 'Ten listo antes de escribir', q1d: 'Tu monto en USD y el cálculo de arriba.\nEl nombre completo del titular de la cuenta donde recibes.\nTu alias, CBU o CVU (revisa que esté bien escrito).\nEl comprobante de tu transferencia, cuando el administrador te indique a qué cuenta enviar.',
      q2t: 'Comisiones por transferencia', q2a: 'Menos de {t} USD', q2b: 'Desde {t} USD', q2n: 'Elige arriba si la comisión va incluida en el monto o aparte.',
      q3t: 'Pesos a dólares', q3d: 'No se cobra comisión. Escríbele a Justo o Boris y acuerden la cotización del momento.',
      q4t: 'Para operar más rápido', q4d: 'Completa “Agiliza tu operación” y toca Copiar mensaje.\nActúa dentro de los 10 minutos del precio congelado.\nEscribe solo a Justo o Boris.',
      f1q: '¿Cuánto cobran de comisión?', f1a: 'Para montos menores a {t} USD la comisión es de {f} USD fijos. Desde {t} USD es el {p}% del monto a enviar.',
      f2q: '¿Qué significa comisión incluida o aparte?', f2a: 'Incluida: la comisión se calcula dentro del monto que envías, así que pagas exactamente ese monto. Aparte: recibes el monto completo en pesos y la comisión se suma a lo que pagas.',
      f3q: '¿Cuánto dura el precio?', f3a: 'Al confirmar con un administrador, el precio queda congelado 10 minutos. Pasado ese tiempo se actualiza, por eso conviene actuar rápido.',
      f4q: '¿Cómo sé que es seguro?', f4a: 'Opera únicamente con los administradores verificados Justo y Boris, cuyos números están en esta página. No envíes dinero a ningún otro contacto.',
      f5q: '¿Dónde recibo mis pesos?', f5a: 'Directo en tu banco de preferencia o en tu billetera virtual, sin filas.',
      f6q: '¿Y si quiero cambiar pesos a dólares?', f6a: 'No se cobra comisión. Escríbele a un administrador para acordar la cotización en el momento.'
    },
    en: {
      loading: 'Loading rate…', tagline: 'CURRENCY EXCHANGE · ECUADOR TO ARGENTINA', rateToday: 'DOLLAR TODAY',
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
      alertTarget: 'Target rate (pesos per USD)', alertPhone: 'Your WhatsApp (with country code)', alertBtn: 'Notify me',
      alertPriv: 'We will only use your number for this alert.', alertOk: 'Done! We will notify you on WhatsApp.',
      alertBad: 'Check the rate and your WhatsApp number.', alertErr: 'Could not save. Please try again.',
      shareTitle: 'Share and join', shareSub: 'Recommend Dólar PesoPro and join the group for updates.', shareBtn: 'Share with a friend',
      shareText: 'Exchange dollars for pesos between Ecuador and Argentina with Dólar PesoPro. Check the rate here:',
      group: 'WhatsApp group', groupSub: 'Scan the QR or tap the button to join.', join: 'Join the group', follow: 'Follow us on Instagram',
      instTitle: 'Keep the app on your phone', instBtn: 'Install app',
      instAndroid: 'Tap the Chrome menu ⋮ and choose “Install app” or “Add to Home screen”.',
      instIos: 'In Safari tap the Share button and choose “Add to Home Screen”.',
      histTitle: 'Rate history', histEmpty: 'The latest published rates will appear here.',
      brandTag: 'OUR BRAND', brandH: 'Convert better, save more!',
      brandP: 'Dólar PesoPro connects Ecuador and Argentina with fast, clear currency exchange and verified administrators.',
      brandAdm: 'your verified administrators', copyright: '© 2026 Dólar PesoPro. All rights reserved.',
      disclaimer: 'Important notice: the values shown are an indicative simulation calculated with the stated rate and may change without notice. A transfer is only valid once confirmed by a verified administrator (Justo or Boris); at that moment the price is frozen for 10 minutes. Always double-check the account details before sending money. This content is informational and is not financial advice.',
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
      q4t: 'To go faster', q4d: 'Fill in “Speed up your transfer” and tap Copy message.\nAct within the 10 minutes of the frozen price.\nOnly write to Justo or Boris.',
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
    amount: '100', mode: 'incluida', manual: null, dir: 'usd', gtab: 'como', faq: -1,
    holder: '', bank: '', alias: '', shown: 0, target: null, copied: false, admin: false, alerts: [], alSent: 0
  };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    return d.toLocaleString(S.lang === 'en' ? 'en-GB' : 'es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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
      rate: numOr(v.rate, 0) > 0 ? v.rate : DEFAULTS.rate, prev: numOr(v.prev, 0), updatedAt: numOr(v.updatedAt, 0),
      allowManual: v.allowManual !== false, feeFixed: Math.max(0, numOr(v.feeFixed, DEFAULTS.feeFixed)),
      feeThreshold: numOr(v.feeThreshold, 0) > 0 ? v.feeThreshold : DEFAULTS.feeThreshold, feePct: Math.max(0, numOr(v.feePct, DEFAULTS.feePct)),
      minUsd: Math.max(0, numOr(v.minUsd, DEFAULTS.minUsd)), announcement: typeof v.announcement === 'string' ? v.announcement : '',
      hoursOn: v.hoursOn === true, hoursFrom: typeof v.hoursFrom === 'string' ? v.hoursFrom : DEFAULTS.hoursFrom,
      hoursTo: typeof v.hoursTo === 'string' ? v.hoursTo : DEFAULTS.hoursTo
    };
  }
  function histList() {
    var h = S.historyRaw;
    if (!Array.isArray(h)) h = h ? Object.keys(h).map(function (k) { return h[k]; }) : [];
    return h.filter(function (x) { return x && typeof x.rate === 'number'; }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }
  if (fbOk) {
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      db = firebase.database(); auth = firebase.auth();
      auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function () {});   // la sesión de admin no se guarda en el dispositivo
      db.ref('.info/connected').on('value', function (s) { S.online = !!s.val(); update(); });
      db.ref('config').on('value', function (s) {
        var old = S.cfg.rate; S.cfg = readCfg(s.val()); S.live = true;
        if (!S.firstCfg && old !== S.cfg.rate) { var h = $('#hero'); h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); liveToast(old); }
        S.firstCfg = false; update(); if (S.admin) refreshPanel(); maybeInitialToast();
      }, function () {});
      db.ref('history').on('value', function (s) { S.historyRaw = s.val() || []; update(); }, function () {});
      auth.onAuthStateChanged(function (u) {
        if (u && u.email === window.ADMIN_EMAIL) mountPanel(); else unmountPanel();
      });
    } catch (e) { fbOk = false; db = null; auth = null; }
  }

  /* ---------- cálculo ---------- */
  function calc() {
    var c = S.cfg, mv = num(S.manual), useM = c.allowManual && S.manual !== null && mv > 0;
    var rate = useM ? mv : c.rate, amt = num(S.amount), incl = S.mode === 'incluida';
    var fee = amt < c.feeThreshold ? c.feeFixed : amt * c.feePct / 100;
    var feeLabel = amt < c.feeThreshold ? t('feeFixedLbl', { n: fmtN(c.feeFixed) }) : t('feePctLbl', { n: fmtN(c.feePct) });
    var net = incl ? amt - fee : amt, pay = incl ? amt : amt + fee;
    var ok = amt > 0 && amt >= c.minUsd && net > 0;
    return { rate: rate, official: c.rate, useM: useM, amt: amt, fee: fee, feeLabel: feeLabel, net: net, pay: pay, ok: ok, receive: ok ? net * rate : 0 };
  }
  function message(k) {
    var L = ['Hola, quiero hacer un cambio con Dólar PesoPro.', ''];
    if (S.dir === 'ars') {
      L = ['Hola, quiero cambiar pesos a dólares con Dólar PesoPro.', '¿Me indican la cotización del momento?'];
    } else if (k.ok) {
      L.push('Envío: ' + usd(k.amt) + ' (comisión ' + (S.mode === 'incluida' ? 'incluida' : 'aparte') + ')');
      L.push('Cotización: ' + ars(k.rate)); L.push('Recibiré: ' + ars(k.receive));
    } else L.push('Quiero cotizar un cambio de dólares a pesos.');
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
  function renderGuide() {
    var c = S.cfg, a = $('#gComo'); a.textContent = '';
    [1, 2, 3, 4].forEach(function (i) {
      var s = el('div', 'step'), n = el('i', null, String(i)), b = el('div'), h = el('b', null, t('s' + i + 't')), d = el('div', 'sub', t('s' + i + 'd'));
      b.appendChild(h); b.appendChild(d); s.appendChild(n); s.appendChild(b); a.appendChild(s);
    });
    var g = $('#gGuia'); g.textContent = '';
    function box(title, lines) { var x = el('div', 'panelbox'); x.appendChild(el('b', null, title)); lines.forEach(function (l) { x.appendChild(el('p', null, l)); }); return x; }
    g.appendChild(box(t('q1t'), t('q1d').split('\n')));
    var fb = el('div', 'panelbox'); fb.appendChild(el('b', null, t('q2t')));
    [[t('q2a', { t: fmtN(c.feeThreshold) }), t('feeFixedLbl', { n: fmtN(c.feeFixed) })], [t('q2b', { t: fmtN(c.feeThreshold) }), t('feePctLbl', { n: fmtN(c.feePct) })]].forEach(function (r) {
      var row = el('div', 'frow'); row.appendChild(el('span', null, r[0])); row.appendChild(el('strong', null, r[1])); fb.appendChild(row);
    });
    fb.appendChild(el('p', null, t('q2n'))); g.appendChild(fb);
    g.appendChild(box(t('q3t'), [t('q3d')])); g.appendChild(box(t('q4t'), t('q4d').split('\n')));
    var f = $('#gFaq'); f.textContent = '';
    for (var i = 1; i <= 6; i++) (function (i) {
      var w = el('div'); w.id = 'faq' + i;
      var q = el('button', 'faqq'); q.type = 'button'; q.appendChild(el('span', null, t('f' + i + 'q')));
      var ch = el('span', 'chev'); ch.innerHTML = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)"><path d="M6 9l6 6 6-6"/></svg>';
      q.appendChild(ch);
      var acc = el('div', 'acc'), inner = el('div'); inner.appendChild(el('p', null, t('f' + i + 'a', { t: fmtN(c.feeThreshold), f: fmtN(c.feeFixed), p: fmtN(c.feePct) }))); acc.appendChild(inner);
      w.appendChild(q); w.appendChild(acc);
      if (S.faq === i) w.classList.add('open');
      q.setAttribute('aria-expanded', S.faq === i ? 'true' : 'false');
      q.addEventListener('click', function () {
        S.faq = S.faq === i ? -1 : i;
        $$('#gFaq > div').forEach(function (d, idx) { var o = S.faq === idx + 1; d.classList.toggle('open', o); d.querySelector('button').setAttribute('aria-expanded', o ? 'true' : 'false'); });
      });
      f.appendChild(w);
    })(i);
  }
  var guideKey = '';
  function setGuideTab() {
    $$('#gtabs .chip').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-g') === S.gtab); });
    $('#gComo').style.display = S.gtab === 'como' ? 'flex' : 'none';
    $('#gGuia').style.display = S.gtab === 'guia' ? 'flex' : 'none';
    $('#gFaq').style.display = S.gtab === 'faq' ? 'flex' : 'none';
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
  function update() {
    var c = S.cfg, k = calc(); S.lastCalc = k;
    /* cotización */
    setText('#officialBig', ars(c.rate));
    var tr = $('#trend');
    if (c.prev > 0 && c.prev !== c.rate && S.live) { var df = c.rate - c.prev; tr.textContent = (df > 0 ? '▲ +' : '▼ −') + fmtN(Math.abs(df)); } else tr.textContent = '';
    setText('#updTxt', c.updatedAt ? t('upd', { d: whenTxt(c.updatedAt) }) : t('updNone'));
    var dot = $('#liveDot'), lt = $('#liveTxt');
    if (!fbOk) { dot.className = 'dot off'; lt.textContent = t('liveDemo'); }
    else if (S.online && S.live) { dot.className = 'dot g'; lt.textContent = t('liveOn'); }
    else { dot.className = 'dot off'; lt.textContent = t('liveOff'); }
    /* gráfica */
    var h = histList(), pts = h.slice(0, 8).reverse().map(function (x) { return x.rate; }), sp = $('#spark');
    if (pts.length >= 2) {
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
    if (c.hoursOn && a != null && b != null) {
      var n = arMinutes(), open = a <= b ? (n >= a && n < b) : (n >= a || n < b);
      chip.hidden = false; $('#hoursDot').className = 'dot ' + (open ? 'g' : 'off');
      setText('#hoursTxt', t(open ? 'open' : 'closed', { a: c.hoursFrom, b: c.hoursTo }));
    } else chip.hidden = true;
    /* calculadora */
    var usdOn = S.dir === 'usd';
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
    $('#copyBtn').classList.toggle('ok', S.copied); setText('#copyTxt', t(S.copied ? 'copied' : 'copy')); setText('#stCopyTxt', S.copied ? '¡Copiado!' : 'Copiar mensaje');
    /* guía (se redibuja si cambia el idioma o las comisiones) */
    var gk = S.lang + '|' + c.feeFixed + '|' + c.feeThreshold + '|' + c.feePct;
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
    $('#sticky').classList.toggle('show', S.splashDone === true);
  }

  /* ---------- eventos ---------- */
  var amountEl = $('#amount'), rateEl = $('#rate');
  bindClean(amountEl); bindClean(rateEl); bindClean($('#alTarget'));
  amountEl.addEventListener('input', function () { S.amount = amountEl.value; update(); });
  amountEl.addEventListener('focus', function () { var e = amountEl; setTimeout(function () { try { e.select(); } catch (x) {} }, 30); });
  [amountEl, rateEl].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') x.blur(); }); });
  $('#rateAdj').addEventListener('click', function () { S.rateOpen = !S.rateOpen; update(); if (S.rateOpen) setTimeout(function () { rateEl.focus(); }, 350); });
  rateEl.addEventListener('input', function () { S.manual = rateEl.value; update(); });
  $('#rateReset').addEventListener('click', function () { S.manual = null; rateEl.value = inN(S.cfg.rate); update(); });
  $$('#seg button').forEach(function (b) { b.addEventListener('click', function () { S.mode = b.getAttribute('data-mode'); update(); }); });
  $$('#dirTabs button').forEach(function (b) { b.addEventListener('click', function () { S.dir = b.getAttribute('data-dir'); update(); }); });
  $$('#gtabs .chip').forEach(function (b) { b.addEventListener('click', function () { S.gtab = b.getAttribute('data-g'); setGuideTab(); }); });
  function applyTheme(next) {
    S.theme = next; document.documentElement.setAttribute('data-theme', next);
    $('#themeBtn').setAttribute('aria-label', next === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.setAttribute('content', next === 'dark' ? '#070B26' : '#0F1B5C');
  }
  $('#themeBtn').addEventListener('click', function () {
    var btn = this, next = S.theme === 'light' ? 'dark' : 'light', root = document.documentElement;
    btn.classList.add('spin'); setTimeout(function () { btn.classList.remove('spin'); }, 750);
    if (reduce) { applyTheme(next); return; }
    if (document.startViewTransition) {
      var r = btn.getBoundingClientRect();
      root.style.setProperty('--cx', (r.left + r.width / 2) + 'px'); root.style.setProperty('--cy', (r.top + r.height / 2) + 'px');
      if (window.CSS && CSS.registerProperty) root.classList.add('feather');
      var vt = document.startViewTransition(function () { applyTheme(next); });
      vt.finished.then(function () { root.classList.remove('feather'); }, function () { root.classList.remove('feather'); });
    } else {
      root.classList.add('theme-anim'); applyTheme(next); setTimeout(function () { root.classList.remove('theme-anim'); }, 1100);
    }
  });
  ['holder', 'bank', 'alias'].forEach(function (id) { $('#' + id).addEventListener('input', function (e) { S[id] = e.target.value; update(); }); });
  function doCopy() {
    var m = $('#msgbox').value;
    function done() { try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {} S.copied = true; update(); clearTimeout(S.ct); S.ct = setTimeout(function () { S.copied = false; update(); }, 2500); }
    function fb() {
      try { var x = document.createElement('textarea'); x.value = m; x.setAttribute('readonly', ''); x.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
        document.body.appendChild(x); x.focus(); x.select(); x.setSelectionRange(0, 99999); var ok = document.execCommand('copy'); document.body.removeChild(x); if (ok) done(); } catch (e) {}
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
  $('#guideFoot').addEventListener('click', function () { setSheet(true); });
  $('#sheetClose').addEventListener('click', function () { setSheet(false); });
  $('#sheetBd').addEventListener('click', function () { setSheet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSheet(false); });
  $('#shareBtn').addEventListener('click', function () {
    var url = location.href.split('#')[0], text = t('shareText') + ' ' + url;
    function fb() { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); }
    try { if (navigator.share) navigator.share({ title: 'Dólar PesoPro', text: t('shareText'), url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') fb(); }); else fb(); } catch (e) { fb(); }
  });
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); S.dip = e; update(); });
  $('#instBtn').addEventListener('click', function () { if (S.dip) { S.dip.prompt(); S.dip = null; update(); } });
  $('#alBtn').addEventListener('click', function () {
    var target = num($('#alTarget').value), phone = $('#alPhone').value.replace(/\D/g, ''), msg = $('#alMsg');
    if (!(target > 0 && target < 100000) || phone.length < 8 || phone.length > 15 || S.alSent >= 3) { msg.textContent = t('alertBad'); msg.style.color = '#E5484D'; return; }
    if (!db) { msg.textContent = t('alertErr'); msg.style.color = '#E5484D'; return; }
    db.ref('alerts').push({ phone: phone, target: target, at: firebase.database.ServerValue.TIMESTAMP }).then(function () {
      S.alSent++; msg.textContent = t('alertOk'); msg.style.color = 'var(--green)'; $('#alTarget').value = ''; $('#alPhone').value = '';
    }).catch(function () { msg.textContent = t('alertErr'); msg.style.color = '#E5484D'; });
  });

  /* ---------- panel de administrador ---------- */
  var gate = $('#gate'), slot = $('#adminSlot');
  function openGate() { if (S.admin) return; gate.hidden = false; setTimeout(function () { gate.scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#pass').focus(); }, 60); }
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
    if (/PERMISSION_DENIED|permission/i.test((e && e.message) || '') || /permission/.test(c)) return 'Sin permiso: vuelve a entrar con tu clave.';
    return 'No se pudo completar (' + (c || 'error') + ').';
  }
  function login() {
    var gm = $('#gateMsg'), pw = $('#pass').value;
    if (!auth) { gm.textContent = 'Falta conectar Firebase (revisa el README).'; return; }
    if (!pw) { gm.textContent = 'Escribe la clave.'; return; }
    $('#passBtn').disabled = true; gm.textContent = '';
    auth.signInWithEmailAndPassword(window.ADMIN_EMAIL, pw).then(function () { $('#pass').value = ''; })
      .catch(function (e) { gm.textContent = errMsg(e); }).then(function () { $('#passBtn').disabled = false; });
  }
  $('#passBtn').addEventListener('click', login);
  $('#pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });

  var P = null;   // nodos del panel
  function pa(id) { return slot.querySelector('#' + id); }
  function msgA(txt, bad) { var m = pa('aMsg'); if (!m) return; m.textContent = txt; m.classList.toggle('msgerr', !!bad); }
  function mountPanel() {
    if (S.admin) return; S.admin = true; gate.hidden = true;
    slot.appendChild(document.getElementById('adminTpl').content.cloneNode(true));
    $$('input[inputmode="decimal"]', slot).forEach(function (i) { bindClean(i); i.addEventListener('input', function () { i.dataset.dirty = '1'; }); });
    ['aAnn', 'aFrom', 'aTo'].forEach(function (id) { pa(id).addEventListener('input', function (e) { e.target.dataset.dirty = '1'; }); });
    var st = pa('aSteps');
    [-10, -5, 5, 10].forEach(function (d) {
      var b = el('button', 'chip', (d > 0 ? '+' : '−') + Math.abs(d)); b.type = 'button';
      b.addEventListener('click', function () { var r = pa('aRate'); r.value = inN(Math.max(1, num(r.value) + d)); r.dataset.dirty = '1'; }); st.appendChild(b);
    });
    function run(p, ok, grp) {
      msgA('Guardando…');
      p.then(function () { (grp || []).forEach(function (id) { delete pa(id).dataset.dirty; }); msgA(ok + ' ✓ Ya está en vivo para los clientes.'); refreshPanel(); })
        .catch(function (e) { msgA(errMsg(e), true); });
    }
    pa('aPub').addEventListener('click', function () {
      var v = num(pa('aRate').value); if (!(v > 0)) { msgA('Escribe una cotización válida.', true); return; }
      var cur = S.cfg.rate, prev = cur !== v ? cur : S.cfg.prev, now = Date.now();
      var items = [{ rate: v, at: now }].concat(histList().map(function (x) { return { rate: x.rate, at: x.at || 0 }; })).slice(0, 20);
      msgA('Publicando…');
      db.ref().update({ 'config/rate': v, 'config/prev': prev, 'config/updatedAt': firebase.database.ServerValue.TIMESTAMP, 'history': items })
        .then(function () { return db.ref('config/rate').once('value'); })
        .then(function (s) { delete pa('aRate').dataset.dirty; msgA('Publicada ✓ Confirmado en el servidor: ' + ars(s.val()) + '. Los clientes ya la ven.'); refreshPanel(); })
        .catch(function (e) { msgA(errMsg(e), true); });
    });
    pa('aManual').addEventListener('click', function () { run(db.ref('config/allowManual').set(!S.cfg.allowManual), 'Permiso actualizado'); });
    pa('aFees').addEventListener('click', function () {
      var f = num(pa('aFixed').value), th = num(pa('aThr').value), pc = num(pa('aPct').value), mn = num(pa('aMin').value);
      if (!(th > 0) || pc > 30 || mn > 100000) { msgA('Revisa los valores.', true); return; }
      run(db.ref('config').update({ feeFixed: f, feeThreshold: th, feePct: pc, minUsd: mn }), 'Comisiones guardadas', ['aFixed', 'aThr', 'aPct', 'aMin']);
    });
    pa('aAnnBtn').addEventListener('click', function () { run(db.ref('config/announcement').set(pa('aAnn').value.trim().slice(0, 200)), 'Aviso guardado', ['aAnn']); });
    pa('aHoursOn').addEventListener('click', function () { run(db.ref('config/hoursOn').set(!S.cfg.hoursOn), 'Horario actualizado'); });
    pa('aHoursBtn').addEventListener('click', function () {
      if (toMin(pa('aFrom').value) == null || toMin(pa('aTo').value) == null) { msgA('Elige las dos horas.', true); return; }
      run(db.ref('config').update({ hoursFrom: pa('aFrom').value, hoursTo: pa('aTo').value }), 'Horario guardado', ['aFrom', 'aTo']);
    });
    pa('aPassBtn').addEventListener('click', function () {
      var np = pa('aNewPass').value; if (np.length < 6) { msgA('La clave debe tener al menos 6 caracteres.', true); return; }
      msgA('Guardando…');
      auth.currentUser.updatePassword(np).then(function () { pa('aNewPass').value = ''; msgA('Clave cambiada ✓ Úsala la próxima vez.'); })
        .catch(function (e) { msgA(/recent/.test(e.code || '') ? 'Sal y vuelve a entrar, luego repite.' : errMsg(e), true); });
    });
    pa('aOut').addEventListener('click', function () { auth.signOut(); });
    S.alRef = db.ref('alerts'); S.alRef.on('value', function (s) {
      var v = s.val() || {}; S.alerts = Object.keys(v).map(function (k) { return { id: k, phone: v[k].phone, target: v[k].target, at: v[k].at }; }); renderAlerts();
    }, function () {});
    refreshPanel();
    setTimeout(function () { slot.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }
  function unmountPanel() {
    if (!S.admin) return; S.admin = false;
    if (S.alRef) { S.alRef.off(); S.alRef = null; }
    slot.textContent = '';
  }
  function refreshPanel() {
    if (!S.admin || !pa('aRate')) return; var c = S.cfg;
    function fill(id, v) { var n = pa(id); if (n && !n.dataset.dirty && document.activeElement !== n) n.value = v; }
    fill('aRate', inN(c.rate)); fill('aFixed', inN(c.feeFixed)); fill('aThr', inN(c.feeThreshold)); fill('aPct', inN(c.feePct)); fill('aMin', inN(c.minUsd));
    fill('aAnn', c.announcement); fill('aFrom', c.hoursFrom); fill('aTo', c.hoursTo);
    pa('aManual').classList.toggle('on', c.allowManual); pa('aHoursOn').classList.toggle('on', c.hoursOn);
    pa('aManual').setAttribute('aria-checked', c.allowManual ? 'true' : 'false'); pa('aHoursOn').setAttribute('aria-checked', c.hoursOn ? 'true' : 'false');
    pa('aManualHelp').textContent = c.allowManual ? 'Activado: cada cliente puede ajustar la cotización en su propio cálculo.' : 'Desactivado: los clientes solo ven la cotización oficial.';
    pa('aLive').innerHTML = '<b>Lo que ven los clientes ahora</b><br>Cotización: <b>' + ars(c.rate) + '</b><br>Comisión: <b>' + fmtN(c.feeFixed) + ' USD</b> bajo ' + fmtN(c.feeThreshold) + ' USD · <b>' + fmtN(c.feePct) + '%</b> desde ahí<br>Mínimo para calcular: <b>' + fmtN(c.minUsd) + ' USD</b> · Cambio manual: <b>' + (c.allowManual ? 'permitido' : 'bloqueado') + '</b><br>Conexión: <b>' + (S.online ? 'en vivo' : 'sin conexión') + '</b>';
    renderAlerts();
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
    if (S.toastShown || !S.splashDone || !S.live) return; S.toastShown = true;
    var c = S.cfg; if (!(c.prev > 0) || c.prev === c.rate) return;
    var up = c.rate > c.prev, w = relTime(c.updatedAt);
    showToast(up, 'El dólar ' + (up ? 'subió' : 'bajó') + ' ' + fmtN(Math.abs(c.rate - c.prev)) + ' pesos' + (w ? ' · ' + w : ''));
  }
  function liveToast(old) {
    var up = S.cfg.rate > old; showToast(up, 'Cotización actualizada: ' + (up ? '+' : '−') + fmtN(Math.abs(S.cfg.rate - old)) + ' → ' + ars(S.cfg.rate));
  }

  /* ---------- arranque ---------- */
  applyStatic(); update();
  setInterval(update, 30000);
  setTimeout(function () { S.splashDone = true; $('#splash').classList.add('hide'); update(); setTimeout(maybeInitialToast, 500); }, 1500);
})();
