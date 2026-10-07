import { sb, handler } from './_lib.js';
const CONSENT_VERSION = 'v2-2026-10'; // cambiar si cambia el texto de la casilla
export default handler(async ({ role, name, courses, slots, modality = 'ambas', consent }) => {
  if (!consent) throw new Error('Falta el consentimiento informado.');
  if (!['mentor', 'mentee'].includes(role) || !name?.trim() || !courses?.length || !slots?.length)
    throw new Error('Completa nombre, curso y al menos un horario.');
  const [row] = await sb('profiles', {
    method: 'POST',
    body: JSON.stringify({
      role, name: name.trim().slice(0, 80), courses, slots, modality,
      consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION,
      approved: role === 'mentee', // los mentores quedan pendientes hasta que la coordinación los apruebe
    }),
  });
  return { id: row.id, code: row.access_code };
});
