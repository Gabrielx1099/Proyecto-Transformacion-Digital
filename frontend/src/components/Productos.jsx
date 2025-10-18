import React, { useState, useEffect } from 'react';
import '../css/Productos.css';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

function Productos() {
  // ===============================
  // CONFIGURACIÓN
  // ===============================
  const BACKEND_PORT = 8081;

  // ===============================
  // ESTADO DEL COMPONENTE
  // ===============================
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [imagen, setImagen] = useState(null);

  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [productos, setProductos] = useState([]);

  // Estados de UI
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('rol'));

  // Navegación y Contexto del Carrito
  const navigate = useNavigate();
  const { fetchCarrito, carrito } = useCarrito();

  // ===============================
  // EFECTOS
  // ===============================
  
  // Efecto principal de inicialización
  useEffect(() => {
    obtenerDatosIniciales();
    fetchProductos();
    
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('rol'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Efecto para filtrar subcategorías cuando cambia la categoría
  useEffect(() => {
    console.log('Filtrando subcategorías:', { categoriaId, subcategorias });

    if (categoriaId && Array.isArray(subcategorias) && subcategorias.length > 0) {
      let idParaFiltrar = parseInt(categoriaId);

      // MODIFICACIÓN INICIA AQUI
      
      if (idParaFiltrar === 1) { 
        idParaFiltrar = 2; 
      } else if (idParaFiltrar === 2) { 
        idParaFiltrar = 1; 
      }
      // MODIFICACIÓN TERMINA AQUI

      const subcategoriasDeLaCategoria = subcategorias.filter(
        sub => sub.id_categoria === idParaFiltrar
      );
      console.log('Subcategorías filtradas:', subcategoriasDeLaCategoria);
      setSubcategoriasFiltradas(subcategoriasDeLaCategoria);
      setSubcategoriaId(''); // Resetear subcategoría seleccionada
    } else {
      setSubcategoriasFiltradas([]);
      setSubcategoriaId('');
    }
  }, [categoriaId, subcategorias]);

  // ===============================
  // FUNCIONES DE API
  // ===============================
  
  const obtenerDatosIniciales = async () => {
    try {
      // Obtener categorías
      const categoriasResponse = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/categorias`);
      const categoriasData = await categoriasResponse.json();
      // Invertir nombres para IDs 1 y 2 si es necesario para que coincidan con la visualización de catálogos
      const adjustedCategoriasData = categoriasData.map(cat => {
        if (cat.id_categoria === 1) return { ...cat, nombre: 'Pañalería' }; // Si ID 1 es Higiene en BD, mostrar como Pañalería
        if (cat.id_categoria === 2) return { ...cat, nombre: 'Higiene' };   // Si ID 2 es Pañalería en BD, mostrar como Higiene
        return cat; // Mantener otras categorías como están
      });
      setCategorias(adjustedCategoriasData);

      // Obtener subcategorías
      const subcategoriasResponse = await fetch(`http://localhost:${BACKEND_PORT}/api/subcategorias`);
      const subcategoriasData = await subcategoriasResponse.json();
      console.log('Subcategorías cargadas:', subcategoriasData);
      setSubcategorias(subcategoriasData);

      // Obtener marcas
      const marcasResponse = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/marcas`);
      const marcasData = await marcasResponse.json();
      setMarcas(marcasData);

    } catch (error) {
      console.error('Error al obtener datos iniciales:', error);
      setMensaje('Error al cargar datos iniciales.');
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/productos`);
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      } else {
        console.error('Error al obtener productos:', response.status);
      }
    } catch (error) {
      console.error('Error de red al obtener productos:', error);
    }
  };

  const agregarAlCarrito = async (producto) => {
    const idUsuario = localStorage.getItem('idUsuario');
    await fetchCarrito(idUsuario); // Siempre asegura el carrito activo

    // Ahora usa carrito.idVenta para agregar el producto
    await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/detalle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idVenta: carrito.idVenta,
        id_producto: producto.id_producto,
        cantidad: 1
      })
    });

    await fetchCarrito(idUsuario); // Refresca el carrito
  };

  // ===============================
  // MANEJADORES DE EVENTOS
  // ===============================
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('stock', stock);
    formData.append('idCategoria', categoriaId);
    formData.append('idSubcategoria', subcategoriaId);
    formData.append('idMarca', marcaId);
    
    if (imagen) {
      formData.append('file', imagen);
    }

    // Debug
    console.log('Datos enviados:', {
      categoriaId,
      subcategoriaId,
      nombre,
      precio,
      stock,
      marcaId
    });

    try {
      const url = editandoProducto 
        ? `http://localhost:${BACKEND_PORT}/api/catalogo/productos/${editandoProducto.id_producto}`
        : `http://localhost:${BACKEND_PORT}/api/catalogo/productos`;
      
      const method = editandoProducto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (response.ok) {
        setMensaje(editandoProducto ? 'Producto actualizado con éxito!' : 'Producto agregado con éxito!');
        limpiarFormulario();
        fetchProductos();
      } else {
        setMensaje(`Error al ${editandoProducto ? 'actualizar' : 'agregar'} producto: ${data.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error al procesar producto:', error);
      setMensaje('Error de conexión al procesar producto.');
    }
  };

  const editarProducto = (producto) => {
    setEditandoProducto(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio.toString());
    setStock(producto.stock.toString());
    setCategoriaId(producto.idCategoria.toString());
    setSubcategoriaId(producto.idSubcategoria.toString());
    setMarcaId(producto.idMarca.toString());
    setMostrarFormulario(true);
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/productos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMensaje('Producto eliminado con éxito!');
        fetchProductos();
      } else {
        setMensaje('Error al eliminar producto.');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setMensaje('Error de conexión al eliminar producto.');
    }
  };

  // ===============================
  // FUNCIONES AUXILIARES
  // ===============================
  
  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setStock('');
    setCategoriaId('');
    setSubcategoriaId('');
    setMarcaId('');
    setImagen(null);
    setMostrarFormulario(false);
    setEditandoProducto(null);
  };

  const obtenerNombreSubcategoria = (idSubcategoria) => {
    const subcategoria = subcategorias.find(sub => sub.id_subcategoria === idSubcategoria);
    return subcategoria ? subcategoria.nombre : 'Sin subcategoría';
  };

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(cat => cat.id_categoria === idCategoria);
    return categoria ? categoria.nombre : 'Desconocida';
  };

  const obtenerNombreMarca = (idMarca) => {
    const marca = marcas.find(marca => marca.id_marca === idMarca);
    return marca ? marca.nombre : 'Desconocida';
  };

  // ===============================
  // COMPONENTES DE RENDERIZADO
  // ===============================
  
  const renderTablaProductos = () => (
    <div>
      {userRole === 'admin' && (
        <button onClick={() => setMostrarFormulario(true)}>
          Agregar Nuevo Producto
        </button>
      )}
          
      {userRole === 'admin' && (
        <div style={{ marginBottom: '20px' }}>    
          {/* NUEVOS BOTONES PARA REPORTES */}
          <button 
            onClick={() => descargarReporte('excel')}
            style={{ marginLeft: '10px', backgroundColor: '#28a745', color: 'white' }}
          >
            📊 Descargar Excel
          </button>
          
          <button 
            onClick={() => descargarReporte('pdf')}
            style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white' }}
          >
            📄 Descargar PDF
          </button>
        </div>
      )}
      
      <h3>Lista de Productos</h3>
      
      {productos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Marca</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id_producto}>
                <td>{producto.nombre}</td>
                <td>S/.{producto.precio.toFixed(2)}</td>
                <td>{producto.stock}</td>
                <td>{obtenerNombreCategoria(producto.idCategoria)}</td>
                <td>{obtenerNombreSubcategoria(producto.idSubcategoria)}</td>
                <td>{obtenerNombreMarca(producto.idMarca)}</td>
                <td>
                  {userRole === 'admin' ? (
                    <>
                      <button 
                        onClick={() => editarProducto(producto)}
                        style={{ marginRight: '5px', backgroundColor: '#007bff', color: 'white' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => eliminarProducto(producto.id_producto)}
                        style={{ backgroundColor: '#dc3545', color: 'white' }}
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{mensaje || "No hay productos disponibles."}</p>
      )}
    </div>
  );

  const renderFormulario = () => (
    <form onSubmit={handleSubmit}>
      <h2>{editandoProducto ? 'Editar Producto' : 'Ingresar Nuevo Producto'}</h2>
      
      <div>
        <label>Nombre:</label>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
        />
      </div>
      
      <div>
        <label>Precio:</label>
        <input 
          type="number" 
          step="0.01" 
          value={precio} 
          onChange={(e) => setPrecio(e.target.value)} 
          required 
        />
      </div>
      
      <div>
        <label>Stock:</label>
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
          required 
        />
      </div>
      
      <div>
        <label>Imagen:</label>
        <input 
          type="file" 
          onChange={(e) => setImagen(e.target.files[0])} 
        />
      </div>
      
      <div>
        <label>Categoría:</label>
        <select 
          value={categoriaId} 
          onChange={(e) => setCategoriaId(e.target.value)} 
          required
        >
          <option value="">Seleccione una categoría</option>
          {categorias.map(cat => (
            <option key={cat.id_categoria} value={cat.id_categoria}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Subcategoría:</label>
        <select 
          value={subcategoriaId} 
          onChange={(e) => setSubcategoriaId(e.target.value)} 
          required
          disabled={!categoriaId}
        >
          <option value="">
            {categoriaId ? 'Seleccione una subcategoría' : 'Primero seleccione una categoría'}
          </option>
          {subcategoriasFiltradas.map(sub => (
            <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
              {sub.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Marca:</label>
        <select 
          value={marcaId} 
          onChange={(e) => setMarcaId(e.target.value)} 
          required
        >
          <option value="">Seleccione una marca</option>
          {marcas.map(marca => (
            <option key={marca.id_marca} value={marca.id_marca}>
              {marca.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <button type="submit">
          {editandoProducto ? 'Actualizar Producto' : 'Agregar Producto'}
        </button>
        <button type="button" onClick={() => limpiarFormulario()}>
          Cancelar
        </button>
      </div>
    </form>
  );

  // Función para descargar reportes
  const descargarReporte = async (formato) => {
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/catalogo/productos/export/${formato}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const fecha = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `productos_${fecha}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMensaje(`Reporte ${formato.toUpperCase()} descargado exitosamente!`);
      } else {
        setMensaje(`Error al descargar el reporte ${formato.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      setMensaje('Error de conexión al descargar reporte');
    }
  };

  // ===============================
  // RENDER PRINCIPAL
  // ===============================
  
  return (
    <div className="productos-container">
      <h2>Gestión de Productos</h2>

      {mensaje && (
        <p className={mensaje.includes('Error') ? 'error' : 'success'}>
          {mensaje}
        </p>
      )}

      {!mostrarFormulario ? renderTablaProductos() : renderFormulario()}
    </div>
  );
}

export default Productos;