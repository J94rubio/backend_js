const fs = require('node:fs');
const path = require('node:path');

const { buscarMascota, obtenerCitasMascota } = require('./datosMascotas');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('No se encontró GEMINI_API_KEY en el entorno');
}

const MODELO = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const URL_INTERACCIONES = `${(
  process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
).replace(/\/+$/, '')}/interactions`;
const MAX_RONDAS = 10;

const SYSTEM_INSTRUCTION = fs.readFileSync(path.join(__dirname, 'prompt.txt'), 'utf8').trim();
const TOOLS = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools.json'), 'utf8'));

class GeminiError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

async function crearInteraccion(cuerpo) {
  const respuesta = await fetch(URL_INTERACCIONES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      model: MODELO,
      tools: TOOLS,
      system_instruction: SYSTEM_INSTRUCTION,
      ...cuerpo,
    }),
    signal: AbortSignal.timeout(90000),
  });

  const texto = await respuesta.text();

  if (!respuesta.ok) {
    throw new GeminiError(respuesta.status, texto);
  }

  return JSON.parse(texto);
}

async function ejecutarFuncion(nombre, argumentos) {
  if (nombre === 'buscar_mascota') return buscarMascota(argumentos.nombre);
  if (nombre === 'obtener_citas_mascota') return obtenerCitasMascota(argumentos.mascota_id);

  throw new Error(`Función desconocida: ${nombre}`);
}

// Equivale a interaction.output_text del SDK: texto del último bloque de salida del modelo.
function textoDeSalida(interaccion) {
  const pasos = Array.isArray(interaccion.steps) ? interaccion.steps : [];
  const partes = [];
  let recolectando = false;

  for (let i = pasos.length - 1; i >= 0; i -= 1) {
    const paso = pasos[i];

    if (paso.type === 'user_input') break;

    if (paso.type !== 'model_output' || !Array.isArray(paso.content)) {
      if (recolectando) break;
      continue;
    }

    for (let j = paso.content.length - 1; j >= 0; j -= 1) {
      const bloque = paso.content[j];

      if (bloque.type === 'text') {
        recolectando = true;
        partes.push(typeof bloque.text === 'string' ? bloque.text : '');
      } else if (recolectando) {
        return partes.reverse().join('');
      }
    }
  }

  return partes.reverse().join('');
}

async function generarRespuesta(mensaje, previousInteractionId) {
  const parametros = { input: mensaje };

  if (previousInteractionId) parametros.previous_interaction_id = previousInteractionId;

  let interaccion = await crearInteraccion(parametros);

  for (let ronda = 0; ronda < MAX_RONDAS; ronda += 1) {
    const llamadas = (interaccion.steps || []).filter((paso) => paso.type === 'function_call');

    if (!llamadas.length) break;

    const resultados = [];

    for (const llamada of llamadas) {
      const resultado = await ejecutarFuncion(llamada.name, llamada.arguments || {});

      resultados.push({
        type: 'function_result',
        name: llamada.name,
        call_id: llamada.id,
        result: [{ type: 'text', text: JSON.stringify(resultado) }],
      });
    }

    interaccion = await crearInteraccion({
      previous_interaction_id: interaccion.id,
      input: resultados,
    });
  }

  const respuesta = textoDeSalida(interaccion);

  if (!respuesta) {
    throw new Error('Gemini no devolvió contenido en la respuesta.');
  }

  return { respuesta, interaction_id: interaccion.id };
}

module.exports = { generarRespuesta, GeminiError, textoDeSalida };
