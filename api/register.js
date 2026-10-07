import { sb, handler } from './_lib.js';
const CONSENT_VERSION = 'v3-2026-10'; // cambiar si cambia el texto de la casilla
const EMAIL = /^[^\s@]+@unmsm\.edu\.pe$/; // solo correos institucionales
export default handler(async ({ role, name, courses, slots, modality = 'ambas', consent, contact }) => {
  if (!consent) throw new Error('Falta el consentimiento informado.');
  if (!['mentor', 'mentee'].includes(role) || !name?.trim() || !courses?.length || !slots?.length)
    throw new Error('Completa nombre, curso y al menos un horario.');
  let email = null;
  if (role === 'mentor') {
    email = (contact || '').trim().toLowerCase().slice(0, 120);
    if (!EMAIL.test(email)) throw new Error('Como mentor, indica tu correo institucional (@unmsm.edu.pe).');
    const dup = await sb(`profiles?role=eq.mentor&contact_email=eq.${encodeURIComponent(email)}&select=id`);
    if (dup.length) throw new Error('Ya existe un mentor con ese correo. Usa tu enlace personal para editar tu perfil.');
  }
  const [row] = await sb('profiles', {
    method: 'POST',
    body: JSON.stringify({
      role, name: name.trim().slice(0, 80), courses, slots, modality,
      consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION,
      approved: role === 'mentee', // los mentores quedan pendientes hasta que la coordinación los apruebe
      contact_email: email, // solo lo ve la coordinación en /admin.html; ninguna otra API lo devuelve
    }),
  });
  return { id: row.id, code: row.access_code };
});
