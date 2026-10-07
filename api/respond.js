import { sb, handler } from './_lib.js';
const DAYS = { Lun: 1, Mar: 2, 'Mié': 3, Jue: 4, Vie: 5 };
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
export default handler(async ({ code, request_id, action, date, place }) => {
  if (!code || !request_id || !['confirmada', 'rechazada'].includes(action)) throw new Error('Datos incompletos.');
  const [mentor] = await sb(`profiles?role=eq.mentor&access_code=eq.${encodeURIComponent(code)}&select=id`);
  if (!mentor) throw new Error('Enlace no válido.');
  const q = `requests?id=eq.${encodeURIComponent(request_id)}&mentor_id=eq.${mentor.id}&status=eq.pendiente`;
  const [req] = await sb(`${q}&select=slot`);
  if (!req) throw new Error('La solicitud no existe o ya fue respondida.');
  const patch = { status: action, responded_at: new Date().toISOString() };
  if (action === 'confirmada') {
    const day = req.slot.split(' ')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !place?.trim()) throw new Error('Indica la fecha y el lugar o enlace de la sesión.');
    if (date < today()) throw new Error('La fecha no puede ser pasada.');
    if (new Date(`${date}T12:00:00Z`).getUTCDay() !== DAYS[day]) throw new Error(`La fecha debe caer en ${day}, el horario solicitado.`);
    patch.session_date = date;
    patch.session_place = place.trim().slice(0, 120);
  }
  const rows = await sb(q, { method: 'PATCH', body: JSON.stringify(patch) });
  if (!rows.length) throw new Error('La solicitud no existe o ya fue respondida.');
  return { ok: true };
});
