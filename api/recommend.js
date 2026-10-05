import { sb, handler } from './_lib.js';

// Reglas deterministas: curso + horarios en común + modalidad.
// La IA solo redacta la explicación; recibe datos anónimos (sin nombres ni IDs).
async function explain(course, items) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const prompt = `Para el curso "${course}", explica en una frase breve en español (máx. 20 palabras) por qué cada mentor es buena opción. Devuelve solo un arreglo JSON de ${items.length} textos, en el mismo orden. Datos: ${JSON.stringify(items.map(i => ({ horarios_comunes: i.common, modalidad: i.modality })))}`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
      signal: AbortSignal.timeout(8000),
    });
    const out = JSON.parse((await r.json()).candidates[0].content.parts[0].text);
    return Array.isArray(out) && out.length === items.length ? out.map(String) : null;
  } catch { return null; }
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
  const ai = await explain(course, ranked);
  return {
    results: ranked.map((m, i) => ({
      id: m.id, name: m.name, common: m.common, ia: !!ai,
      reason: ai?.[i] || `Enseña ${course}, coincide en ${m.common.join(', ')} y su modalidad (${m.modality}) es compatible.`,
    })),
  };
});
