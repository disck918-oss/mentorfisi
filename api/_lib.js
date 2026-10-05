const U = process.env.SUPABASE_URL, K = process.env.SUPABASE_SERVICE_KEY;
export async function sb(path, opts = {}) {
  const r = await fetch(`${U}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  });
  if (!r.ok) throw new Error('Error de base de datos');
  return r.json();
}
export const handler = (fn) => async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST' });
  try { res.status(200).json(await fn(req.body || {})); }
  catch (e) { res.status(400).json({ error: e.message }); }
};
