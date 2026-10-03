const { errorValidacion, validacion } = require('../../common/errors');

function validarChat(cuerpo) {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw validacion([errorValidacion('body', 'Input should be a valid dictionary')]);
  }

  const errores = [];
  const { mensaje, previous_interaction_id: previo } = cuerpo;

  if (mensaje === undefined) {
    errores.push(errorValidacion('mensaje', 'Field required'));
  } else if (typeof mensaje !== 'string') {
    errores.push(errorValidacion('mensaje', 'Input should be a valid string'));
  } else if (mensaje.length < 1) {
    errores.push(errorValidacion('mensaje', 'String should have at least 1 character'));
  } else if (mensaje.length > 2000) {
    errores.push(errorValidacion('mensaje', 'String should have at most 2000 characters'));
  }

  if (previo !== undefined && previo !== null && typeof previo !== 'string') {
    errores.push(errorValidacion('previous_interaction_id', 'Input should be a valid string'));
  }

  if (errores.length) throw validacion(errores);

  return { mensaje, previousInteractionId: previo || null };
}

module.exports = { validarChat };
