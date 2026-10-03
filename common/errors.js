class HttpError extends Error {
  constructor(status, detail) {
    super(typeof detail === 'string' ? detail : 'Error de validación');
    this.status = status;
    this.detail = detail;
  }
}

function errorValidacion(campo, msg, ubicacion = 'body') {
  return { loc: [ubicacion, campo], msg, type: 'value_error' };
}

function validacion(errores) {
  return new HttpError(422, errores);
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function parseId(valor, nombre) {
  if (!/^\d+$/.test(valor)) {
    throw validacion([
      errorValidacion(nombre, 'Input should be a valid integer', 'path'),
    ]);
  }
  return Number(valor);
}

// Express exige 4 parámetros para reconocer un manejador de errores.
// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ detail: err.detail });
  }

  if (err && err.type === 'entity.parse.failed') {
    return res.status(422).json({
      detail: [errorValidacion('body', 'JSON inválido')],
    });
  }

  console.error(err);
  return res.status(500).json({ detail: 'Internal Server Error' });
}

module.exports = {
  HttpError,
  errorValidacion,
  validacion,
  asyncHandler,
  parseId,
  manejadorErrores,
};
