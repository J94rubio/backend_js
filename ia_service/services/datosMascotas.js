const MASCOTAS_URL = (
  process.env.MASCOTAS_SERVICE_URL || 'http://127.0.0.1:8201/api/mascotas'
).replace(/\/+$/, '');

const CITAS_URL = (
  process.env.CITAS_SERVICE_URL || 'http://127.0.0.1:8202/api/citas'
).replace(/\/+$/, '');

async function pedirJson(url) {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(30000) });

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al consultar ${url}`);
  }

  return respuesta.json();
}

async function buscarMascota(nombre) {
  const mascotas = await pedirJson(`${MASCOTAS_URL}/`);
  const busqueda = String(nombre).trim().toLowerCase();

  const resultados = mascotas.filter((m) =>
    String(m.nombre).trim().toLowerCase().includes(busqueda)
  );

  return {
    encontrada: resultados.length > 0,
    cantidad: resultados.length,
    mascotas: resultados,
  };
}

async function obtenerCitasMascota(mascotaId) {
  return {
    mascota_id: mascotaId,
    citas: await pedirJson(`${CITAS_URL}/mascota/${mascotaId}`),
  };
}

module.exports = { buscarMascota, obtenerCitasMascota };
