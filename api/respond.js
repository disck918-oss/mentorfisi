import { sb, handler } from './_lib.js';
export default handler(async ({ code, request_id, action }) => {
  if (!code || !request_id || !['confirmada', 'rechazada'].includes(action)) throw new Error('Datos incompletos.');
  const [mentor] = await sb(`profiles?role=eq.mentor&access_code=eq.${encodeURIComponent(code)}&select=id`);
  if (!mentor) throw new Error('Enlace no válido.');
  const rows = await sb(`requests?id=eq.${encodeURIComponent(request_id)}&mentor_id=eq.${mentor.id}&status=eq.pendiente`, {
    method: 'PATCH',
    body: JSON.stringify({ status: action, responded_at: new Date().toISOString() }),
  });
  if (!rows.length) throw new Error('La solicitud no existe o ya fue respondida.');
  return { ok: true };
});
