const express = require('express');

const { manejadorErrores } = require('../common/errors');
const citasRouter = require('./routes/citas');

const app = express();

app.use(express.json());

app.use('/api/citas', citasRouter);

app.get('/', (req, res) => {
  res.json({ message: 'DatesPets Citas Service funcionando (Node.js)' });
});

app.use(manejadorErrores);

const puerto = Number(process.env.PORT) || 8202;

app.listen(puerto, '0.0.0.0', () => {
  console.log(`Servicio de citas (Node.js) escuchando en el puerto ${puerto}`);
});
