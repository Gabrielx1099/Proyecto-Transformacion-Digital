from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # ✔ Habilita peticiones desde React

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="bd_transformacion"
    )

@app.route("/recomendar_baratos")
def recomendar_baratos():
    db = conectar()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM productos ORDER BY precio ASC LIMIT 10")
    datos = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify({"titulo": "Productos más económicos", "recomendaciones": datos})

@app.route("/recomendar_vendidos")
def recomendar_vendidos():
    db = conectar()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, SUM(d.cantidad) AS total_vendidos
        FROM detalle_venta d
        INNER JOIN productos p ON p.id_producto = d.id_producto
        GROUP BY p.id_producto
        ORDER BY total_vendidos DESC
        LIMIT 10
    """)
    datos = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify({"titulo": "Más vendidos", "recomendaciones": datos})

@app.route("/recomendar_ofertas")
def recomendar_ofertas():
    db = conectar()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM productos WHERE precio < 100 LIMIT 10")
    datos = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify({"titulo": "Ofertas exclusivas", "recomendaciones": datos})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
