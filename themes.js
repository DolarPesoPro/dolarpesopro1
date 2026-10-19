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
    logo: 'assets/logo-halloween.webp',
    intro: 'assets/intro-halloween.mp4',        // video de bienvenida (se ve una vez cada 6 horas; ?intro=1 lo fuerza)
    introPoster: 'assets/intro-poster.webp',
    // introV: 'assets/intro-halloween-v.mp4',   // OPCIONAL: video vertical 9:16. Quita las // y sube el archivo a assets/. En celulares se usa este; si falta, se usa el horizontal.
    fonts: 'https://fonts.googleapis.com/css2?family=Pirata+One&display=swap',
    costumes: {
      justo: [
        { img: 'assets/justo-h.webp',   say: ['¡Estoy vivo! ⚡ ¡Cambiemos!', '¡Soy Justo-stein! 🤠', 'Aquí para ayudarte ✅'] },
        { img: 'assets/peek-vamp.webp', say: ['Buenas noches… ¿cambiamos? 🧛', 'Soy Justo, ¡pero con colmillos! 🦇', 'Tu plata, bien cuidada 🔒'] }
      ],
      boris: [
        { img: 'assets/boris-h.webp',   say: ['Vengo envuelto en dólares 💵', 'Soy Boris, la momia veloz 😎', 'Cambio rápido y seguro ⚡'] },
        { img: 'assets/peek-wolf.webp', say: ['¡Auuuu! 🐺 ¿Ya cambiaste?', 'Soy Boris, versión lobo 😎', 'Tu plata, bien cuidada 🔒'] }
      ]
    },
    avatars: { justo: 'assets/justo-h.webp', boris: 'assets/boris-h.webp' },
    preload: ['assets/halloween-bg.webp'],
    peeks: [
      { img: 'assets/peek-bear.webp',  say: ['Grrr… ¡hola! 🐻', 'Cuido tu plata como si fuera miel 🍯', '¿Ya cambiaste hoy? 🎃'] },
      { img: 'assets/peek-ghost.webp', say: ['¡Boo! 👻', '¿Te asusté?', '¡No dejes que tu cambio desaparezca!', '¿Subió el dólar? ¿O bajó? 👀'] },
      { img: 'assets/peek-vamp.webp',  say: ['¡Buuu! 🎃', '¿Ya cambiaste hoy?', 'El dólar volvió de entre los muertos 🧛'] },
      { img: 'assets/peek-wolf.webp',  say: ['Auuuu… 🐺', '¡El dólar está que muerde!', '¡Que no te agarre la luna sin cotizar! 🌕'] }
    ]
  }
};
