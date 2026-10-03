const express = require('express');

const db = require('../../common/supabase');
const { HttpError, asyncHandler, parseId } = require('../../common/errors');
const { validarMascota } = require('../schemas/mascota');

const TABLA = 'mascotas';
const COLUMNAS = 'id,nombre,especie,raza,edad,propietario';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await db.seleccionar(TABLA, { columnas: COLUMNAS, orden: 'id' }));
  })
);

router.get(
  '/:mascota_id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.mascota_id, 'mascota_id');
    const filas = await db.seleccionar(TABLA, { columnas: COLUMNAS, filtros: { id } });

    if (!filas.length) throw new HttpError(404, 'Mascota no encontrada');
    res.json(filas[0]);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const datos = validarMascota(req.body, { parcial: false });
    const filas = await db.insertar(TABLA, datos, COLUMNAS);

    if (!filas.length) throw new HttpError(400, 'No fue posible crear la mascota');
    res.status(201).json(filas[0]);
  })
);

router.put(
  '/:mascota_id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.mascota_id, 'mascota_id');
    const cambios = validarMascota(req.body, { parcial: true });

    if (!Object.keys(cambios).length) {
      throw new HttpError(400, 'No se enviaron datos para actualizar');
    }

    const filas = await db.actualizar(TABLA, { id }, cambios, COLUMNAS);

    if (!filas.length) throw new HttpError(404, 'Mascota no encontrada');
    res.json(filas[0]);
  })
);

router.delete(
  '/:mascota_id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.mascota_id, 'mascota_id');
    const filas = await db.eliminar(TABLA, { id }, 'id');

    if (!filas.length) throw new HttpError(404, 'Mascota no encontrada');
    res.status(204).end();
  })
);

module.exports = router;
