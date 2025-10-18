const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        // Leer el archivo schema.sql
        const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
        
        // Ejecutar el script SQL
        await pool.query(schema);
        console.log('Base de datos inicializada correctamente');
        
        // Crear un usuario de prueba
        const hashedPassword = '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX5YxX'; // contraseña: test123
        await pool.query(
            'INSERT INTO usuarios (username, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
            ['usuario_test', 'test@test.com', hashedPassword]
        );
        console.log('Usuario de prueba creado');
        
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    } finally {
        process.exit();
    }
}

initializeDatabase(); 