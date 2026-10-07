import { sb, handler } from './_lib.js';
export default handler(async ({ code }) => {
  if (!code) throw new Error('Falta el código del mentor.');
  const [mentor] = await sb(`profiles?role=eq.mentor&access_code=eq.${encodeURIComponent(code)}&select=id,approved`);
  if (!mentor) throw new Error('Enlace no válido.');
  const items = await sb(`requests?mentor_id=eq.${mentor.id}&select=id,course,slot,status,created_at,session_date,session_place,mentee:profiles!mentee_id(name)&order=created_at.desc&limit=50`);
  return { items, approved: mentor.approved };
});
