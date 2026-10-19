// Configuración de Firebase del proyecto dolarpesopro1
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyA0w5DFErn5v0_1jdHua9EeO3V992Pu__A",
  authDomain: "dolarpesopro1.firebaseapp.com",
  databaseURL: "https://dolarpesopro1-default-rtdb.firebaseio.com",
  projectId: "dolarpesopro1",
  storageBucket: "dolarpesopro1.firebasestorage.app",
  messagingSenderId: "342840653032",
  appId: "1:342840653032:web:3ce4665dcb6ac21233455d"
};

// Correo interno del administrador (el mismo que creaste en Firebase → Authentication).
window.ADMIN_EMAIL = "admin@dolarpesopro.app";

// (Antiguo) Avisos al celular de Justo desde la página. NO pongas aquí tu tema: cualquiera podría verlo.
// Instala la app gratuita "ntfy" en su teléfono,
// suscríbete a un nombre secreto y largo (ej: "pesopro-justo-x7k29q") y escríbelo aquí.
// Déjalo vacío ("") para desactivar.
window.NTFY_TOPIC = "";   // VACÍO a propósito: este archivo es público. El aviso al celular de Justo lo manda ahora la función de Firebase (ver LEEME, PASO 4).

// Google Analytics 4 (opcional). Pega aquí tu ID de medición, que empieza con "G-" (ej: "G-AB12CD34EF").
// Déjalo vacío ("") para no usar Analytics. Nunca cuenta al administrador.
window.GA_ID = "";

// Avisos push al celular de los clientes (opcional). Pega aquí la "clave pública" (VAPID) de
// Firebase → Configuración del proyecto → Cloud Messaging → Certificados push web → Generar par de claves.
// Déjalo vacío ("") y el botón de avisos al celular no aparece.
window.VAPID_KEY = "";

// Carga el inicio de sesión del admin solo cuando se necesita (la página abre más rápido). Si el candado del admin dejara de funcionar, cambia true por false.
window.LAZY_AUTH = true;
