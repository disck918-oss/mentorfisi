import { sb, handler } from './_lib.js';
// El estudiante se identifica con su código personal; se valida mentor aprobado, curso y horario.
export default handler(async ({ mentee_code, mentor_id, course, slot }) => {
  if (!mentee_code || !mentor_id || !course || !slot) throw new Error('Datos incompletos.');
  const [me] = await sb(`profiles?role=eq.mentee&access_code=eq.${encodeURIComponent(mentee_code)}&select=id`);
  if (!me) throw new Error('Enlace no válido. Regístrate de nuevo o usa tu enlace personal.');
  const [mentor] = await sb(`profiles?id=eq.${encodeURIComponent(mentor_id)}&role=eq.mentor&approved=eq.true&select=id,courses,slots`);
  if (!mentor || !mentor.courses.includes(course) || !mentor.slots.includes(slot))
    throw new Error('Ese mentor ya no ofrece ese curso u horario.');
  const dup = await sb(`requests?mentee_id=eq.${me.id}&mentor_id=eq.${mentor.id}&course=eq.${encodeURIComponent(course)}&slot=eq.${encodeURIComponent(slot)}&status=eq.pendiente&select=id`);
  if (dup.length) throw new Error('Ya enviaste esa solicitud y está pendiente.');
  const [row] = await sb('requests', { method: 'POST', body: JSON.stringify({ mentee_id: me.id, mentor_id: mentor.id, course, slot }) });
  return { id: row.id, status: row.status };
});
