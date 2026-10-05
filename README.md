# MentorFISI (prototipo)
Web estática + 3 funciones serverless (Vercel Hobby) + Supabase (Postgres) + Gemini Flash (opcional).

## Despliegue (todo en planes gratuitos)
1. Supabase: crea un proyecto y ejecuta `schema.sql` en SQL Editor.
2. Gemini: crea una API key en https://aistudio.google.com (verifica disponibilidad en Perú).
3. Sube esta carpeta a un repositorio de GitHub e impórtalo en Vercel (Hobby).
4. En Vercel > Settings > Environment Variables agrega:
   - `SUPABASE_URL` (Project Settings > API)
   - `SUPABASE_SERVICE_KEY` (service_role; solo en el servidor, nunca en el HTML)
   - `GEMINI_API_KEY` (opcional; sin ella funciona con explicaciones por reglas)
   - `GEMINI_MODEL` (opcional, por defecto `gemini-2.5-flash`)
5. Redeploy. Prueba: registra un mentor y un estudiante con un horario en común.

## Privacidad
La IA solo recibe curso, horarios en común y modalidad. Nunca nombres, IDs ni notas.

## Pendiente (no incluido)
Autenticación por roles, aceptación/confirmación del mentor, recordatorios, tablero agregado, pruebas automáticas.
