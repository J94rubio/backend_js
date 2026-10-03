const express = require('express');

const { manejadorErrores } = require('../common/errors');
const mascotasRouter = require('./routes/mascotas');

const app = express();

app.use(express.json());

app.use('/api/mascotas', mascotasRouter);

app.get('/', (req, res) => {
  res.json({ message: 'DatesPets Backend funcionando (Node.js)' });
});

app.use(manejadorErrores);

const puerto = Number(process.env.PORT) || 8201;

app.listen(puerto, '0.0.0.0', () => {
  console.log(`Servicio de mascotas (Node.js) escuchando en el puerto ${puerto}`);
});
