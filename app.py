from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "bd_transformacion",
    "port": 3308
}

@app.route("/recomendar_baratos", methods=["GET"])
def recomendar_baratos():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        # Obtener los 4 productos más baratos
        cursor.execute("""
            SELECT id_producto, id_categoria, id_marca, imagen_url, nombre, precio, stock, id_subcategoria
            FROM productos
            WHERE activo = 1 AND stock > 0
            ORDER BY precio ASC
            LIMIT 4
        """)
        productos = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "status": "ok",
            "recomendaciones": productos
        })

    except Exception as e:
        return jsonify({"error": f"Error al obtener recomendaciones: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
