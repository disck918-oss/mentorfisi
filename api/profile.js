import { sb, handler } from './_lib.js';
const SLOT = /^(Lun|Mar|Mié|Jue|Vie) \d{2}:00$/;
const MODS = ['presencial', 'virtual', 'ambas'];
// El mentor edita su propio perfil con su código personal. Si agrega cursos nuevos,
// el perfil vuelve a quedar pendiente de aprobación.
export default handler(async ({ code, action, courses, slots, modality }) => {
  if (!code) throw new Error('Falta el código.');
  const [me] = await sb(`profiles?role=eq.mentor&access_code=eq.${encodeURIComponent(code)}&select=id,courses,slots,modality`);
  if (!me) throw new Error('Enlace no válido.');
  if (action === 'get') return { courses: me.courses, slots: me.slots, modality: me.modality };
  if (action !== 'save') throw new Error('Acción no válida.');
  const okArr = (a, max) => Array.isArray(a) && a.length > 0 && a.length <= max && a.every(x => typeof x === 'string');
  if (!okArr(courses, 10) || !courses.every(c => c.length <= 60)) throw new Error('Elige al menos un curso.');
  if (!okArr(slots, 20) || !slots.every(s => SLOT.test(s))) throw new Error('Elige al menos un horario válido.');
  if (!MODS.includes(modality)) throw new Error('Modalidad no válida.');
  const c = [...new Set(courses)], s = [...new Set(slots)];
  const reapproval = c.some(x => !me.courses.includes(x));
  await sb(`profiles?id=eq.${me.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ courses: c, slots: s, modality, ...(reapproval ? { approved: false } : {}) }),
  });
  return { ok: true, reapproval };
});
