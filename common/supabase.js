const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('No se encontraron SUPABASE_URL y SUPABASE_KEY en el entorno');
}

const BASE = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1`;

async function solicitar(metodo, tabla, { columnas, filtros = {}, orden, cuerpo } = {}) {
  const params = new URLSearchParams();

  if (columnas) params.set('select', columnas);
  for (const [campo, valor] of Object.entries(filtros)) {
    params.set(campo, `eq.${valor}`);
  }
  if (orden) params.set('order', `${orden}.asc`);

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  if (metodo !== 'GET') headers.Prefer = 'return=representation';

  const respuesta = await fetch(`${BASE}/${tabla}?${params}`, {
    method: metodo,
    headers,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(20000),
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(`Supabase respondió ${respuesta.status}: ${texto}`);
  }

  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : [];
}

module.exports = {
  seleccionar: (tabla, opciones) => solicitar('GET', tabla, opciones),
  insertar: (tabla, cuerpo, columnas) => solicitar('POST', tabla, { cuerpo, columnas }),
  actualizar: (tabla, filtros, cuerpo, columnas) =>
    solicitar('PATCH', tabla, { filtros, cuerpo, columnas }),
  eliminar: (tabla, filtros, columnas) => solicitar('DELETE', tabla, { filtros, columnas }),
};
