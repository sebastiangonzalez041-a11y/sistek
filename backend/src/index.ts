// Punto de entrada del backend

import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Ticket System Backend');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
