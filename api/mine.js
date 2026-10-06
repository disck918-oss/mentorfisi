import { sb, handler } from './_lib.js';
export default handler(async ({ code }) => {
  if (!code) throw new Error('Falta el código.');
  const [me] = await sb(`profiles?role=eq.mentee&access_code=eq.${encodeURIComponent(code)}&select=id`);
  if (!me) throw new Error('Enlace no válido.');
  const items = await sb(`requests?mentee_id=eq.${me.id}&select=id,course,slot,status,session_done,rating,mentor:profiles!mentor_id(name)&order=created_at.desc&limit=50`);
  return { items };
});
