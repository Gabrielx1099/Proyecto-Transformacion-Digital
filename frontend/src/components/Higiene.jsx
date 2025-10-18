import React, { useState, useEffect } from 'react';
import '../css/Higiene.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import imagen1 from "../imagenes/Higiene1.jpg"; 
import imagen2 from "../imagenes/Higiene2.jpg";
import imagen3 from "../imagenes/Higiene3.png";
import imagen4 from "../imagenes/Higiene4.png";
// Importaciones de imágenes locales eliminadas, ahora se cargarán desde el backend

// Define el puerto de tu backend Java (por defecto 8081, cámbialo si lo modificaste)
const BACKEND_PORT = 8081;
// Define el ID de la categoría Higiene (¡AJUSTA ESTE VALOR SI ES DIFERENTE EN TU BD!)
const CATEGORIA_ID = 2;

const Carrusel = () => {
  // Usamos las imágenes locales para el carrusel (solo 4 imágenes)
  const images = [imagen1, imagen2, imagen3, imagen4];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 11000); // Ajusta el tiempo si quieres
    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = index => setCurrent(index);

  return (
    <div className="carrusel-container fade-in-carrusel">
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

// Datos de productos locales eliminados, ahora se cargarán de la BD
const productos = [];

const filtros = ['Todos', 'Shampoo', 'Pasta', 'Cepillo']; // Mantener si quieres filtrar por tipo en frontend

const Higiene = () => {
  const [productosHigiene, setProductosHigiene] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('rol'));
  const [marcas, setMarcas] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const navigate = useNavigate();
  const { fetchCarrito } = useCarrito();

  useEffect(() => {
    obtenerProductosHigiene();
    fetchMarcas();
    fetchSubcategorias();

    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('rol'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => { // Cleanup
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
    if (!Array.isArray(marcas)) {
      return 'Marca no disponible';
    }
    const marca = marcas.find(m => m.id_marca === idMarca);
    return marca ? marca.nombre : 'Marca no disponible';
  };

  const obtenerNombreSubcategoria = (idSubcategoria) => {
    if (!Array.isArray(subcategorias)) {
      return 'Subcategoría no disponible';
    }
    const subcategoria = subcategorias.find(s => s.id_subcategoria === idSubcategoria);
    return subcategoria ? subcategoria.nombre : 'Subcategoría no disponible';
  };

  const obtenerProductosHigiene = async () => {
    console.log(`Intentando obtener productos de Higiene para CATEGORIA_ID: ${CATEGORIA_ID}`);
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/productos/categoria/${CATEGORIA_ID}`);
      console.log('Respuesta de la API de Higiene:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Datos de productos de Higiene recibidos:', data);
      setProductosHigiene(data);
    } catch (error) {
      console.error('Error al obtener productos de Higiene:', error);
      setMensaje('Error al cargar los productos de Higiene.');
    }
  };

  const productosFiltrados = productosHigiene.filter((producto) => {
    // Asegúrate de que las propiedades del producto (nombre, tipo) coincidan con las de tu entidad Producto.java si filtras por ellas
    const coincideTipo = filtroActivo === 'Todos' || (producto.tipo && producto.tipo.toLowerCase() === filtroActivo.toLowerCase());
    const coincideBusqueda = busqueda.trim() === '' || (
      (producto.nombre && producto.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (producto.tipo && producto.tipo.toLowerCase().includes(busqueda.toLowerCase())) // Si tu entidad Producto tiene campo 'tipo'
    );
    return coincideTipo && coincideBusqueda;
  });

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

  return (
    <div className="fade-in-up">
      {/* Carrusel */}
      <Carrusel /> {/* Descomenta si tienes imágenes para el carrusel */}

      {/* Barra de búsqueda */}
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

        <main className="productos-grid">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto) => (
              <div key={producto.id_producto} className="card-producto fade-in-right">
                <img src={`http://localhost:${BACKEND_PORT}${producto.imagenUrl}`} alt={producto.nombre} />
                <div className="contenido">
                  <h4>{producto.nombre}</h4>
                  <p><strong>Marca:</strong> {obtenerNombreMarca(producto.idMarca !== undefined ? producto.idMarca : producto.id_marca)}</p>
                  <p><strong>Subcategoría:</strong> {obtenerNombreSubcategoria(producto.idSubcategoria !== undefined ? producto.idSubcategoria : producto.id_subcategoria)}</p>
                  <p><strong>Precio:</strong> S/{producto.precio.toFixed(2)}</p>
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
        </main>
      </div>
    </div>
  );
};

export default Higiene;
