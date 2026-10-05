import { sb, handler } from './_lib.js';
export default handler(async ({ mentee_id, mentor_id, course, slot }) => {
  if (!mentee_id || !mentor_id || !course || !slot) throw new Error('Datos incompletos.');
  const [row] = await sb('requests', { method: 'POST', body: JSON.stringify({ mentee_id, mentor_id, course, slot }) });
  return { id: row.id, status: row.status };
});
