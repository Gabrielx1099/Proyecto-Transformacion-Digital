import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Intranet.css';

const Intranet = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'alimentacion',
    imagen: ''
  });

  useEffect(() => {
    // const token = localStorage.getItem('token'); // Comentado porque no se usa
    const rol = localStorage.getItem('rol');
    // if (!token || rol !== 'admin') { // Comentado para solo verificar el rol
    if (rol !== 'admin') {
      navigate('/');
      return;
    }
    fetchProductos();
  }, [navigate]);

  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/productos', {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Comentado porque no se usa
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      } else {
        setError('Error al cargar los productos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Comentado porque no se usa
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (response.ok) {
        setNuevoProducto({
          nombre: '',
          descripcion: '',
          precio: '',
          categoria: 'alimentacion',
          imagen: ''
        });
        fetchProductos();
      } else {
        setError('Error al crear el producto');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/productos/${id}`, {
          method: 'DELETE',
          headers: {
            // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Comentado porque no se usa
          }
        });

        if (response.ok) {
          fetchProductos();
        } else {
          setError('Error al eliminar el producto');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="intranet-container">
      <h1>Panel de Administración</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="nuevo-producto-form">
        <h2>Agregar Nuevo Producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={nuevoProducto.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={nuevoProducto.descripcion}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={nuevoProducto.precio}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={nuevoProducto.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="alimentacion">Alimentación</option>
              <option value="pañaleria">Pañalería</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="imagen">URL de la Imagen</label>
            <input
              type="url"
              id="imagen"
              name="imagen"
              value={nuevoProducto.imagen}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="submit-button">Agregar Producto</button>
        </form>
      </div>

      <div className="productos-lista">
        <h2>Productos Existentes</h2>
        <div className="tabla-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion}</td>
                  <td>${producto.precio}</td>
                  <td>{producto.categoria}</td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(producto.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Intranet; 