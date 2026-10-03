const { errorValidacion, validacion } = require('../../common/errors');

const ESTADOS = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];

function esFechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

function validarCampo(campo, valor, errores) {
  switch (campo) {
    case 'mascota_id':
      if (!Number.isInteger(valor)) {
        errores.push(errorValidacion(campo, 'Input should be a valid integer'));
      } else if (valor <= 0) {
        errores.push(errorValidacion(campo, 'Input should be greater than 0'));
      }
      break;

    case 'fecha':
      if (!esFechaValida(valor)) {
        errores.push(errorValidacion(campo, 'Input should be a valid date'));
      }
      break;

    case 'motivo':
      if (typeof valor !== 'string') {
        errores.push(errorValidacion(campo, 'Input should be a valid string'));
      } else if (valor.length < 2) {
        errores.push(errorValidacion(campo, 'String should have at least 2 characters'));
      } else if (valor.length > 200) {
        errores.push(errorValidacion(campo, 'String should have at most 200 characters'));
      }
      break;

    case 'estado':
      if (!ESTADOS.includes(valor)) {
        errores.push(
          errorValidacion(campo, 'String should match pattern \'^(Pendiente|Confirmada|Completada|Cancelada)$\'')
        );
      }
      break;
  }
}

// parcial=true valida solo los campos enviados (equivale a CitaUpdate).
function validarCita(cuerpo, { parcial }) {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw validacion([errorValidacion('body', 'Input should be a valid dictionary')]);
  }

  const errores = [];
  const datos = {};

  for (const campo of ['mascota_id', 'fecha', 'motivo', 'estado']) {
    let valor = cuerpo[campo];

    if (valor === undefined || (parcial && valor === null)) {
      if (campo === 'estado' && !parcial) {
        datos.estado = 'Pendiente';
      } else if (!parcial) {
        errores.push(errorValidacion(campo, 'Field required'));
      }
      continue;
    }

    validarCampo(campo, valor, errores);
    datos[campo] = valor;
  }

  if (errores.length) throw validacion(errores);
  return datos;
}

module.exports = { validarCita };
