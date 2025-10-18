import React, { useState, useEffect } from "react";
import "../css/Pañaleria.css";
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

// Importar las imágenes locales para el carrusel
import bebeImg from "../imagenes/bebe.png";
import bebe2Img from "../imagenes/bebe3.png";
import pañal1Img from "../imagenes/pañal1.jpg";
import pañal2Img from "../imagenes/pañal2.jpg";
import pañal4Img from "../imagenes/pañal3.jpg";
import pañal5Img from "../imagenes/pañal4.jpg";
import pañal6Img from "../imagenes/pañal5.jpg";

// Carrusel (mantener la definición)
const Carrusel = () => {
  // Usamos las imágenes locales para el carrusel
  const images = [bebeImg, bebe2Img, pañal1Img, pañal2Img, pañal4Img, pañal5Img, pañal6Img];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 11000); // Ajusta el tiempo si quieres
    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = index => setCurrent(index);

  return (
    <div className="carrusel-container fade-in-carrusel"> {/* Asegúrate de tener las clases CSS para el carrusel */}
      <div className="carrusel" style={{
        width: `${images.length * 100}%`,
        transform: `translateX(-${(100 / images.length) * current}%)`,
        display: 'flex',
        transition: 'transform 1s ease-in-out'
      }}>
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Imagen ${index + 1}`}
            className="carrusel-image"
            style={{ width: `${100 / images.length}%` }}
          />
        ))}
      </div>
      <div className="dots-container">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`dot ${index === current ? "active" : ""}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

// Define el puerto de tu backend Java (por defecto 8081, cámbialo si lo modificaste)
const BACKEND_PORT = 8081;
// Define el ID de la categoría Pañalería (¡AJUSTA ESTE VALOR SI ES DIFERENTE EN TU BD!)
const CATEGORIA_ID = 1; // ID para Pañalería (Corregido según el comportamiento de creación)

// Eliminar o comentar productosBase ya que ahora se cargarán de la BD
// const productosBase = [...];

// Cambiar el nombre de la función a Pañaleria
function Pañaleria() {
  const [productosPañaleria, setProductosPañaleria] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('rol'));
  const [marcas, setMarcas] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const filtros = ["Todos", "Bebé", "Adulto", "Higiene"]; // Mantener si filtras por subcategoría o tipo localmente

  const navigate = useNavigate();
  const { fetchCarrito } = useCarrito();

  const obtenerProductosPañaleria = async () => {
    console.log(`Intentando obtener productos de Pañalería para CATEGORIA_ID: ${CATEGORIA_ID}`);
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/productos/categoria/${CATEGORIA_ID}`);
      console.log('Respuesta de la API de Pañalería:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Datos de productos de Pañalería recibidos:', data);
      setProductosPañaleria(data);
    } catch (error) {
      console.error('Error al obtener productos de Pañalería:', error);
      setMensaje('Error al cargar los productos de Pañalería.');
    }
  };

  useEffect(() => {
    obtenerProductosPañaleria();
    fetchMarcas();
    fetchSubcategorias();
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('rol'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchMarcas = async () => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/marcas`);
      if (res.ok) {
        const data = await res.json();
        setMarcas(data);
      }
    } catch (error) {
      console.error('Error al obtener marcas:', error);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/subcategorias`);
      if (res.ok) {
        const data = await res.json();
        setSubcategorias(data);
      }
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
    }
  };

  const obtenerNombreMarca = (idMarca) => {
    const marca = marcas.find(m => m.id_marca === idMarca);
    return marca ? marca.nombre : 'Marca no disponible';
  };

  const obtenerNombreSubcategoria = (idSubcategoria) => {
    const subcategoria = subcategorias.find(s => s.id_subcategoria === idSubcategoria);
    return subcategoria ? subcategoria.nombre : 'Subcategoría no disponible';
  };

  // Nueva función para agregar al carrito
  const agregarAlCarrito = async (producto) => {
    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) {
      navigate('/login');
      return;
    }
    try {
      // Primero, obtener el carrito activo del usuario o crear uno si no existe
      let carritoActivo = null;
      const responseCarrito = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/activo/${idUsuario}`);

      if (responseCarrito.ok) {
        carritoActivo = await responseCarrito.json();
      } else if (responseCarrito.status === 404) {
        // Si no hay carrito activo (404), crear uno nuevo
        const responseCrear = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idUsuario: parseInt(idUsuario) }),
        });
        if (responseCrear.ok) {
          carritoActivo = await responseCrear.json();
        } else {
          console.error('Error al crear carrito:', responseCrear.statusText);
          setMensaje('Error al agregar producto al carrito.');
          return;
        }
      } else {
        console.error('Error al obtener carrito activo:', responseCarrito.statusText);
        setMensaje('Error al agregar producto al carrito.');
        return;
      }

      // Ahora que tenemos un carrito activo, agregar el detalle
      const detalle = {
        idVenta: carritoActivo.idVenta,
        id_producto: producto.id_producto,
        cantidad: 1
      };

      const responseDetalle = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/detalle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detalle),
      });

      if (responseDetalle.ok) {
        setMensaje('Producto agregado al carrito!');
        fetchCarrito(parseInt(idUsuario));
      } else {
        console.error('Error al agregar detalle:', responseDetalle.statusText);
        setMensaje('Error al agregar producto al carrito.');
      }

    } catch (error) {
      console.error('Error de red al agregar al carrito:', error);
      setMensaje('Error de conexión al agregar producto.');
    }
  };

  const productosFiltrados = productosPañaleria.filter((producto) => {
    // Adapta la lógica de filtrado si las propiedades en tu entidad Producto.java son diferentes
    const coincideCategoria =
      filtroActivo === "Todos" || (producto.categoria && producto.categoria === filtroActivo); // Asumiendo que Producto.java tiene campo 'categoria'
    const coincideBusqueda = busqueda.trim() === '' || (
        (producto.nombre && producto.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        // Agrega otras propiedades por las que quieras buscar si existen en tu entidad
        // || (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );
    return coincideCategoria && coincideBusqueda;
  });

  return (

    <div className="pañaleria-wrapper"> {/* Clase CSS quizás necesite ser pañaleria-wrapper */}
      {/* Carrusel (descomentar para mostrar)*/}
      <Carrusel />

      <div className="barra-busqueda fade-in-down">
        <label htmlFor="busqueda">Buscar:</label>
        <input
          id="busqueda"
          type="text"
          placeholder="Nombre o tipo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="higiene-wrapper fade-in-left">
        {/* Filtro lateral (mantener si quieres filtrar por tipo)*/}
        <aside className="filtro-lateral">
          <h3>Filtrar por tipo</h3>
          {filtros.map((tipo) => (
            <button
              key={tipo}
              className={`filtro-btn ${filtroActivo === tipo ? 'activo' : ''}`}
              onClick={() => setFiltroActivo(tipo)}
            >
              {tipo}
            </button>
          ))}
        </aside>

      

        <div className="productos-grid">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto) => (
              <div className="card-producto" key={producto.id_producto}>
                <img src={`http://localhost:${BACKEND_PORT}${producto.imagenUrl}`} alt={producto.nombre} />
                <div className="contenido">
                  <h4>{producto.nombre}</h4>
                  <p><strong>Marca:</strong> {obtenerNombreMarca(producto.idMarca)}</p>
                  <p><strong>Subcategoría:</strong> {obtenerNombreSubcategoria(producto.idSubcategoria)}</p>
                  <p><strong>Precio:</strong> S/ {producto.precio ? producto.precio.toFixed(2) : 'N/A'}</p>
                  <button 
                    className="btn-comprar" 
                    onClick={() => {
                      if (!userRole) {
                        navigate('/login');
                      } else {
                        agregarAlCarrito(producto);
                      }
                    }}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))
          ) : (
             <p>{mensaje || "No hay productos en esta categoría."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Exportar la función con el nombre corregido
export default Pañaleria;
