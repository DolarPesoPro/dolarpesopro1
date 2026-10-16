// Pruebas de reglas con el emulador de Firebase.
// Uso (en tu PC):  npm i -D @firebase/rules-unit-testing firebase jest
//                  firebase emulators:exec --only database "npx jest tests/rules.test.js"
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');
let env;
const ADMIN = 'admin@dolarpesopro.app';
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-pesopro', database: { rules: fs.readFileSync('firebase.rules.json', 'utf8'), host: '127.0.0.1', port: 9000 } });
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearDatabase());
const pub = () => env.unauthenticatedContext().database();
const adm = () => env.authenticatedContext('a', { email: ADMIN }).database();
const open = (db) => db.ref('status').set({ mode: 'on', fromMin: 0, toMin: 0 });

test('visitante no escribe cotización ni estado', async () => {
  await assertFails(pub().ref('config/rate').set(9999));
  await assertFails(pub().ref('status/mode').set('on'));
});
test('admin sí escribe', async () => {
  await assertSucceeds(adm().ref('status').set({ mode: 'on', fromMin: 480, toMin: 1200 }));
  await assertSucceeds(adm().ref('config/rate').set(1580));
});
test('apagado: visitante no lee config ni history', async () => {
  await assertSucceeds(adm().ref('status').set({ mode: 'off', fromMin: 0, toMin: 0 }));
  await assertSucceeds(adm().ref('config/rate').set(1580));
  await assertFails(pub().ref('config').get());
  await assertFails(pub().ref('history').get());
  await assertSucceeds(pub().ref('status').get());
});
test('encendido: visitante lee config', async () => {
  await assertSucceeds(adm().ref('status').set({ mode: 'on', fromMin: 0, toMin: 0 }));
  await assertSucceeds(pub().ref('config').get());
});
test('alertas: crear sí, leer/pisar/valores raros no', async () => {
  const a = { phone: '5491155551234', target: 1600, at: 1 };
  await assertSucceeds(pub().ref('alerts/abc123').set(a));
  await assertFails(pub().ref('alerts/abc123').set({ ...a, target: 1 }));
  await assertFails(pub().ref('alerts').get());
  await assertFails(pub().ref('alerts/x1').set({ ...a, extra: 'x' }));
  await assertFails(pub().ref('alerts/x2').set({ ...a, phone: 'abc' }));
  await assertFails(pub().ref('alerts/x3').set({ ...a, target: -5 }));
});
test('reseñas: visitante no escribe', async () => {
  await assertFails(pub().ref('reviews/r1').set({ name: 'a', text: 'b', stars: 5, at: 1 }));
});
test('stats.started solo suma de a 1', async () => {
  await assertSucceeds(pub().ref('stats/2026-10-15/started').set(1));
  await assertFails(pub().ref('stats/2026-10-15/started').set(50));
  await assertFails(pub().ref('stats/2026-10-15/done').set(5));
});
