import { sb, handler } from './_lib.js';
const H = 36e5;
// Solo devuelve conteos agregados: nunca nombres, IDs ni códigos.
export default handler(async ({ key }) => {
  if (process.env.DASH_KEY && key !== process.env.DASH_KEY) throw new Error('Clave incorrecta.');
  const [profiles, reqs] = await Promise.all([
    sb('profiles?select=role'),
    sb('requests?select=course,status,created_at,responded_at,session_done,rating'),
  ]);
  const hrs = reqs.filter(r => r.responded_at).map(r => (new Date(r.responded_at) - new Date(r.created_at)) / H).sort((a, b) => a - b);
  const mid = Math.floor(hrs.length / 2);
  const median = !hrs.length ? null : hrs.length % 2 ? hrs[mid] : (hrs[mid - 1] + hrs[mid]) / 2;
  const acc = reqs.filter(r => r.status === 'confirmada');
  const acc24 = acc.filter(r => (new Date(r.responded_at) - new Date(r.created_at)) / H <= 24).length;
  const rated = reqs.filter(r => r.rating);
  const por_curso = {};
  for (const r of reqs) {
    const c = (por_curso[r.course] ??= { solicitudes: 0, aceptadas: 0 });
    c.solicitudes++;
    if (r.status === 'confirmada') c.aceptadas++;
  }
  return {
    mentores: profiles.filter(p => p.role === 'mentor').length,
    estudiantes: profiles.filter(p => p.role === 'mentee').length,
    solicitudes: reqs.length,
    pendientes: reqs.filter(r => r.status === 'pendiente').length,
    aceptadas: acc.length,
    rechazadas: reqs.filter(r => r.status === 'rechazada').length,
    pct_aceptadas_24h: reqs.length ? Math.round((100 * acc24) / reqs.length) : null,
    mediana_min: median === null ? null : Math.round(median * 60),
    realizadas: reqs.filter(r => r.session_done === true).length,
    no_realizadas: reqs.filter(r => r.session_done === false).length,
    satisfaccion: rated.length ? Math.round((10 * rated.reduce((a, r) => a + r.rating, 0)) / rated.length) / 10 : null,
    pct_4_5: rated.length ? Math.round((100 * rated.filter(r => r.rating >= 4).length) / rated.length) : null,
    por_curso,
  };
});
