const { errorValidacion, validacion } = require('../../common/errors');

const CAMPOS_TEXTO = {
  nombre: { min: 2, max: 100 },
  especie: { min: 2, max: 50 },
  raza: { min: 2, max: 100 },
  propietario: { min: 2, max: 150 },
};

function validarTexto(campo, valor, errores) {
  const { min, max } = CAMPOS_TEXTO[campo];

  if (typeof valor !== 'string') {
    errores.push(errorValidacion(campo, 'Input should be a valid string'));
  } else if (valor.length < min) {
    errores.push(errorValidacion(campo, `String should have at least ${min} characters`));
  } else if (valor.length > max) {
    errores.push(errorValidacion(campo, `String should have at most ${max} characters`));
  }
}

function validarEdad(valor, errores) {
  if (!Number.isInteger(valor)) {
    errores.push(errorValidacion('edad', 'Input should be a valid integer'));
  } else if (valor < 0) {
    errores.push(errorValidacion('edad', 'Input should be greater than or equal to 0'));
  }
}

// parcial=true valida solo los campos enviados (equivale a MascotaUpdate).
function validarMascota(cuerpo, { parcial }) {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw validacion([errorValidacion('body', 'Input should be a valid dictionary')]);
  }

  const errores = [];
  const datos = {};

  for (const campo of [...Object.keys(CAMPOS_TEXTO), 'edad']) {
    const valor = cuerpo[campo];

    if (valor === undefined || (parcial && valor === null)) {
      if (!parcial) errores.push(errorValidacion(campo, 'Field required'));
      continue;
    }

    if (campo === 'edad') validarEdad(valor, errores);
    else validarTexto(campo, valor, errores);

    datos[campo] = valor;
  }

  if (errores.length) throw validacion(errores);
  return datos;
}

module.exports = { validarMascota };
