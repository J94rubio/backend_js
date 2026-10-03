const express = require('express');

const { manejadorErrores } = require('../common/errors');
const chatRouter = require('./routes/chat');

const app = express();

app.use(express.json());

app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.json({ message: 'DatesPets IA Service funcionando (Node.js)' });
});

app.use(manejadorErrores);

const puerto = Number(process.env.PORT) || 8203;

app.listen(puerto, '0.0.0.0', () => {
  console.log(`Servicio de IA (Node.js) escuchando en el puerto ${puerto}`);
});
