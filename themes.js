// ───────────── TEMÁTICAS DÓLAR PESO PRO ─────────────
// Las frases temáticas viven exclusivamente en estas listas `say`.
// Las mascotas conservan la identidad visual de Dollar Peso Pro.
window.PP_THEMES = {
  halloween: {
    name: 'Halloween · Frankenstein y Momia',
    emoji: '🎃',
    desc: 'Pareja de Halloween con las mascotas originales de Dollar Peso Pro.',
    splash: 'halloween',
    avatars: { justo: 'assets/justo-h.jpg', boris: 'assets/boris-h.jpg' },
    preload: ['assets/halloween-bg.jpg', 'assets/justo-h.jpg', 'assets/boris-h.jpg'],
    peeks: [
      { img: 'assets/justo-h.jpg', say: ['¡Buuu! 🎃', '¿Ya cambiaste hoy?', '¡Subió el dólar! ¿O bajó? 👀'] },
      { img: 'assets/boris-h.jpg', say: ['¡No te quedes congelado con el cambio! 🧟', 'Tranqui, soy una momia buena onda 😎', '¡Tu plata sigue viva!'] }
    ]
  },
  dracula_lobo: {
    name: 'Drácula y Lobo',
    emoji: '🧛',
    desc: 'Segunda pareja temática. Mantiene las gafas, el logo SP y el estilo de las mascotas.',
    splash: 'halloween',
    avatars: { justo: 'assets/justo-h.jpg', boris: 'assets/boris-h.jpg' },
    preload: ['assets/halloween-bg.jpg', 'assets/peek-vamp.jpg', 'assets/peek-wolf.jpg'],
    peeks: [
      { img: 'assets/peek-vamp.jpg', say: ['Buenas noches… ¿ya cambiaste hoy? 🧛', '¡El dólar volvió de entre los muertos!', '¿Subió el dólar? 👀'] },
      { img: 'assets/peek-wolf.jpg', say: ['¡Auuuu! 🐺', '¡Que no te agarre la luna sin cotizar!', '¿Ya cambiaste hoy?'] }
    ]
  }
};
