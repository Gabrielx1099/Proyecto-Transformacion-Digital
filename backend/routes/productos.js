const express = require('express');
const router = express.Router();
const pool = require('../database');

// Ruta para obtener categorías
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_categoria AS id, nombre FROM Categorias');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener categorías');
  }
});

// Ruta para obtener marcas
router.get('/marcas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id_marca AS id, nombre FROM Marcas');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener marcas');
  }
});

// Ruta para agregar un nuevo producto
router.post('/productos', async (req, res) => {
  const { nombre, precio, stock, id_categoria, id_marca } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Productos (nombre, precio, stock, id_categoria, id_marca) VALUES (?, ?, ?, ?, ?)',
      [nombre, precio, stock, id_categoria, id_marca]
    );
    res.status(201).json({ message: 'Producto agregado con éxito', productId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar producto');
  }
});

module.exports = router; 