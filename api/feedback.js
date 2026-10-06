import { sb, handler } from './_lib.js';
export default handler(async ({ code, request_id, done, rating }) => {
  if (!code || !request_id || typeof done !== 'boolean') throw new Error('Datos incompletos.');
  if (done && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) throw new Error('La calificación debe ser de 1 a 5.');
  const [me] = await sb(`profiles?role=eq.mentee&access_code=eq.${encodeURIComponent(code)}&select=id`);
  if (!me) throw new Error('Enlace no válido.');
  const rows = await sb(`requests?id=eq.${encodeURIComponent(request_id)}&mentee_id=eq.${me.id}&status=eq.confirmada&session_done=is.null`, {
    method: 'PATCH',
    body: JSON.stringify({ session_done: done, rating: done ? rating : null, feedback_at: new Date().toISOString() }),
  });
  if (!rows.length) throw new Error('La solicitud no está disponible para calificar.');
  return { ok: true };
});
