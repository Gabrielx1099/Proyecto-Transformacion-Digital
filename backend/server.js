const express = require('express');
const cors = require('cors');
require('dotenv').config();
const productosRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');
const carritoRoutes = require('./routes/carrito');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', productosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 