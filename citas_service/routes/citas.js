const express = require('express');

const db = require('../../common/supabase');
const { HttpError, asyncHandler, parseId } = require('../../common/errors');
const { validarCita } = require('../schemas/cita');

const TABLA = 'citas';
const COLUMNAS = 'id,mascota_id,fecha,motivo,estado';

const router = express.Router();

async function verificarMascota(mascotaId) {
  const filas = await db.seleccionar('mascotas', { columnas: 'id', filtros: { id: mascotaId } });

  if (!filas.length) throw new HttpError(404, 'La mascota indicada no existe');
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await db.seleccionar(TABLA, { columnas: COLUMNAS, orden: 'id' }));
  })
);

router.get(
  '/mascota/:mascota_id',
  asyncHandler(async (req, res) => {
    const mascotaId = parseId(req.params.mascota_id, 'mascota_id');

    await verificarMascota(mascotaId);

    res.json(
      await db.seleccionar(TABLA, {
        columnas: COLUMNAS,
        filtros: { mascota_id: mascotaId },
        orden: 'fecha',
      })
    );
  })
);

router.get(
  '/:cita_id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.cita_id, 'cita_id');
    const filas = await db.seleccionar(TABLA, { columnas: COLUMNAS, filtros: { id } });

    if (!filas.length) throw new HttpError(404, 'Cita no encontrada');
    res.json(filas[0]);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const datos = validarCita(req.body, { parcial: false });

    await verificarMascota(datos.mascota_id);

    const filas = await db.insertar(TABLA, datos, COLUMNAS);

    if (!filas.length) throw new HttpError(400, 'No fue posible crear la cita');
    res.status(201).json(filas[0]);
  })
);

router.put(
  '/:cita_id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.cita_id, 'cita_id');
    const cambios = validarCita(req.body, { parcial: true });

    const existente = await db.seleccionar(TABLA, { columnas: COLUMNAS, filtros: { id } });

    if (!existente.length) throw new HttpError(404, 'Cita no encontrada');

    if (!Object.keys(cambios).length) {
      throw new HttpError(400, 'No se enviaron datos para actualizar');
    }

    if ('mascota_id' in cambios) await verificarMascota(cambios.mascota_id);

    const filas = await db.actualizar(TABLA, { id }, cambios, COLUMNAS);

    if (!filas.length) throw new HttpError(404, 'No fue posible actualizar la cita');
    res.json(filas[0]);
  })
);

router.delete(
  '/:cita_id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.cita_id, 'cita_id');
    const filas = await db.eliminar(TABLA, { id }, 'id');

    if (!filas.length) throw new HttpError(404, 'Cita no encontrada');
    res.status(204).end();
  })
);

module.exports = router;
