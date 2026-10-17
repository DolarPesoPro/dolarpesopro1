// ───────────── TEMÁTICAS ─────────────
// Cada temática puede cambiar: logo, diseño (look), disfraces de las mascotas y frases de las apariciones.
// `costumes`: lista de disfraces por mascota; la página los alterna sola cada ~9 segundos.
// Para sumar otra temática: copia el bloque 'halloween', cambia nombre/rutas, sube las imágenes a assets/.
window.PP_THEMES = {
  halloween: {
    name: 'Halloween',
    emoji: '🎃',
    desc: 'Una sola temática: diseño, logo y mascotas de Halloween. Cada cliente ve al azar a Frankenstein y la Momia o al Vampiro y el Lobo, y van alternando solos. Funciona en modo claro y oscuro.',
    look: 'halloween',
    splash: 'halloween',
    logo: 'assets/logo-halloween.jpg',
    fonts: 'https://fonts.googleapis.com/css2?family=Pirata+One&display=swap',
    costumes: {
      justo: [
        { img: 'assets/justo-h.jpg',   say: ['¡Estoy vivo! ⚡ ¡Cambiemos!', '¡Soy Justo-stein! 🤠', 'Aquí para ayudarte ✅'] },
        { img: 'assets/peek-vamp.jpg', say: ['Buenas noches… ¿cambiamos? 🧛', 'Soy Justo, ¡pero con colmillos! 🦇', 'Tu plata, bien cuidada 🔒'] }
      ],
      boris: [
        { img: 'assets/boris-h.jpg',   say: ['Vengo envuelto en dólares 💵', 'Soy Boris, la momia veloz 😎', 'Cambio rápido y seguro ⚡'] },
        { img: 'assets/peek-wolf.jpg', say: ['¡Auuuu! 🐺 ¿Ya cambiaste?', 'Soy Boris, versión lobo 😎', 'Tu plata, bien cuidada 🔒'] }
      ]
    },
    avatars: { justo: 'assets/justo-h.jpg', boris: 'assets/boris-h.jpg' },
    preload: ['assets/halloween-bg.jpg'],
    peeks: [
      { img: 'assets/peek-bear.jpg',  say: ['Grrr… ¡hola! 🐻', 'Cuido tu plata como si fuera miel 🍯', '¿Ya cambiaste hoy? 🎃'] },
      { img: 'assets/peek-ghost.jpg', say: ['¡Boo! 👻', '¿Te asusté?', '¡No dejes que tu cambio desaparezca!', '¿Subió el dólar? ¿O bajó? 👀'] },
      { img: 'assets/peek-vamp.jpg',  say: ['¡Buuu! 🎃', '¿Ya cambiaste hoy?', 'El dólar volvió de entre los muertos 🧛'] },
      { img: 'assets/peek-wolf.jpg',  say: ['Auuuu… 🐺', '¡El dólar está que muerde!', '¡Que no te agarre la luna sin cotizar! 🌕'] }
    ]
  }
};
