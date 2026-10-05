import { sb, handler } from './_lib.js';
export default handler(async ({ role, name, courses, slots, modality = 'ambas', consent }) => {
  if (!consent) throw new Error('Falta el consentimiento informado.');
  if (!['mentor', 'mentee'].includes(role) || !name?.trim() || !courses?.length || !slots?.length)
    throw new Error('Completa nombre, curso y al menos un horario.');
  const [row] = await sb('profiles', { method: 'POST', body: JSON.stringify({ role, name: name.trim().slice(0, 80), courses, slots, modality }) });
  return { id: row.id };
});
