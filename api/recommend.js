import { sb, handler } from './_lib.js';

async function explain(course, items) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { err: 'falta GEMINI_API_KEY en Vercel' };
  const prompt = `Para el curso "${course}", explica en una frase breve en español (máx. 20 palabras) por qué cada mentor encaja, usando SOLO los datos dados (horarios comunes y modalidad). No inventes cualidades, experiencia, notas ni método de enseñanza. Devuelve solo un arreglo JSON de ${items.length} textos, en el mismo orden. Datos: ${JSON.stringify(items.map(i => ({ horarios_comunes: i.common, modalidad: i.modality })))}`;
  try {
    const r = await fetchRetry(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
      signal: AbortSignal.timeout(20000),
    });
    const d = await r.json();
    if (!r.ok) return { err: `Gemini ${r.status}: ${(d.error?.message || '').slice(0, 200)}` };
    const text = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    const out = JSON.parse(text);
    if (!Array.isArray(out) || out.length !== items.length) return { err: 'formato inesperado: ' + text.slice(0, 100) };
    return { out: out.map(String) };
  } catch (e) { return { err: e.message }; }
}

export default handler(async ({ course, slots = [], modality = 'ambas' }) => {
  if (!course) throw new Error('Elige un curso.');
  const filter = encodeURIComponent(`{"${course.replace(/["{}\\]/g, '')}"}`);
  const mentors = await sb(`profiles?role=eq.mentor&courses=cs.${filter}`);
  const ranked = mentors
    .map(m => {
      const common = m.slots.filter(s => slots.includes(s));
      const modeOk = modality === 'ambas' || m.modality === 'ambas' || m.modality === modality;
      return { id: m.id, name: m.name, modality: m.modality, common, modeOk, score: common.length * 2 + (modeOk ? 1 : 0) };
    })
    .filter(m => m.common.length && m.modeOk)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const ai = ranked.length ? await explain(course, ranked) : {};
  return {
    ia_error: ai.err,
    results: ranked.map((m, i) => ({
      id: m.id, name: m.name, common: m.common, ia: !!ai.out,
      reason: ai.out?.[i] || `Enseña ${course}, coincide en ${m.common.join(', ')} y su modalidad (${m.modality}) es compatible.`,
    })),
  };
});

async function fetchRetry(url, opts, n = 3) {
  let r;
  for (let i = 0; i < n; i++) {
    r = await fetch(url, opts);
    if (r.status !== 503 && r.status !== 429) return r;
    await new Promise(res => setTimeout(res, 1500 * (i + 1)));
  }
  return r;
}
