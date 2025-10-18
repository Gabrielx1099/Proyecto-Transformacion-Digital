const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Verificar si el usuario ya existe
        const [userExists] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (userExists.length > 0) {
            return res.status(400).json({ message: 'Usuario ya existe' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear nuevo usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Obtener el usuario recién creado
        const [newUserRows] = await pool.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [result.insertId]
        );
        const newUser = newUserRows[0];

        // Generar token
        const token = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const [userRows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (userRows.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = userRows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router; 