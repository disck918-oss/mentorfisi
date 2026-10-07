import { sb, handler } from './_lib.js';
// Sin la variable ADMIN_KEY en Vercel, el acceso queda deshabilitado.
export default handler(async ({ key, action, id }) => {
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) throw new Error('Acceso denegado.');
  if (action === 'list')
    return { items: await sb('profiles?role=eq.mentor&approved=eq.false&select=id,name,courses,slots,modality,created_at&order=created_at.asc') };
  if (!id || !['approve', 'reject'].includes(action)) throw new Error('Datos incompletos.');
  const base = `profiles?id=eq.${encodeURIComponent(id)}&role=eq.mentor&approved=eq.false`;
  const rows = action === 'approve'
    ? await sb(base, { method: 'PATCH', body: JSON.stringify({ approved: true }) })
    : await sb(base, { method: 'DELETE' });
  if (!rows.length) throw new Error('Perfil no encontrado o ya procesado.');
  return { ok: true };
});
