// ───────────── TEMÁTICAS ─────────────
// Cada temática es un bloque. Para agregar una nueva (Navidad, Mundial, Día de la Madre…):
//   1) copia el bloque 'halloween' y cámbiale la clave (ej: 'navidad'), nombre, emoji y descripción;
//   2) sube sus imágenes a assets/ y escribe sus rutas aquí;
//   3) (opcional) agrega su paisaje de carga en style.css:  .splash[data-scene=navidad]{ ... }
// Aparece sola en el panel → "Temáticas", con botones Probar / Activar / Desactivar.
window.PP_THEMES = {
  halloween: {
    name: 'Halloween',
    emoji: '🎃',
    desc: 'Cementerio con luna llena en la carga, Justo y Boris disfrazados, y personajes que se asoman de vez en cuando.',
    splash: 'halloween',                                   // paisaje de la pantalla de carga (ver style.css)
    avatars: { justo: 'assets/justo-h.jpg', boris: 'assets/boris-h.jpg' },   // reemplazan a Justo y Boris en todo el sitio
    preload: ['assets/halloween-bg.jpg'],
    peeks: [                                               // se asoman por el borde cada tanto (déjalo vacío [] para no usarlos)
      { img: 'assets/peek-vamp.jpg',  say: ['¡Buuu! 🎃', '¿Cambiamos antes de que anochezca? 🦇'] },
      { img: 'assets/peek-wolf.jpg',  say: ['Auuuu… 🐺', 'Mejor cotización que la luna llena 😎'] },
      { img: 'assets/peek-bear.jpg',  say: ['Grrr… ¡hola! 🐻', 'Tranqui, no muerdo… mucho 😁'] },
      { img: 'assets/peek-ghost.jpg', say: ['Boo! 👻', '¿Te asusté? 😄'] }
    ]
  }
};
