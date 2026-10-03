const express = require('express');

const { HttpError, asyncHandler } = require('../../common/errors');
const { generarRespuesta, GeminiError } = require('../services/ia');
const { validarChat } = require('../schemas/chat');

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { mensaje, previousInteractionId } = validarChat(req.body);

    try {
      res.json(await generarRespuesta(mensaje, previousInteractionId));
    } catch (error) {
      console.error('ERROR EN CHAT IA:', error.name, error.message);

      const texto = String(error.message);
      const limite =
        (error instanceof GeminiError && error.status === 429) ||
        texto.includes('RESOURCE_EXHAUSTED');

      if (limite) {
        throw new HttpError(
          429,
          'Se alcanzó el límite de uso de la IA. Intenta de nuevo en unos minutos.'
        );
      }

      throw new HttpError(500, `${error.name}: ${texto}`);
    }
  })
);

module.exports = router;
