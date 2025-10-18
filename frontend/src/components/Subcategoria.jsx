import React, { useState, useEffect } from 'react';
import '../css/Subcategoria.css'; // Puedes renombrar este archivo a Subcategoria.css si es neceasrio

const SubcategoriaManagement = () => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [subcategoriaEditando, setSubcategoriaEditando] = useState(null);
  const [nombreEditando, setNombreEditando] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const BACKEND_PORT = 8081; // Cambia por el puerto correcto

  useEffect(() => {
    cargarCategorias();
    cargarSubcategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/categorias`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      const adjustedCategoriasData = data.map(cat => {
        if (cat.id_categoria === 2) return { ...cat, nombre: 'Pañalería' }; // Si ID 1 es Higiene en BD, mostrar como Pañalería
        if (cat.id_categoria === 1) return { ...cat, nombre: 'Higiene' };   // Si ID 2 es Pañalería en BD, mostrar como Higiene
        return cat; // Mantener otras categorías como están
      });
      setCategorias(adjustedCategoriasData.map(cat => ({ id_categoria: cat.id_categoria, nombre: cat.nombre })));
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setMensaje('Error al cargar categorías');
    }
  };

  const cargarSubcategorias = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/subcategorias`);
      if (!res.ok) throw new Error('Error al cargar subcategorías');
      const data = await res.json();
      console.log('Subcategorías cargadas:', data); // Para debug
      setSubcategorias(data);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
      setMensaje('Error al cargar subcategorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMensaje('El nombre de la subcategoría es requerido');
      return;
    }
    if (!categoriaSeleccionada) {
      setMensaje('Debe seleccionar una categoría');
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        nombre: nombre.trim(),
        id_categoria: parseInt(categoriaSeleccionada) 
      };
      console.log('Enviando payload:', payload); 
      
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/subcategorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error del servidor:', errorText);
        throw new Error('Error al agregar subcategoría');
      }
      
      const newSubcategoria = await res.json();
      console.log('Subcategoría creada:', newSubcategoria); // Para debug
      
      setNombre('');
      setCategoriaSeleccionada('');
      setBusqueda('');
      setMensaje('Subcategoría agregada correctamente');
      cargarSubcategorias();
    } catch (error) {
      console.error('Error al agregar subcategoría:', error);
      setMensaje('Error al agregar subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (subcategoria) => {
    console.log('Iniciando edición:', subcategoria); // Para debug
    setSubcategoriaEditando(subcategoria.id_subcategoria);
    setNombreEditando(subcategoria.nombre);
    // Usar idCategoria si existe, sino usar id_categoria
    setCategoriaEditando(subcategoria.idCategoria || subcategoria.id_categoria);
  };

  const guardarEdicion = async () => {
    if (!nombreEditando.trim()) {
      setMensaje('El nombre de la subcategoría es requerido');
      return;
    }
    if (!categoriaEditando) {
      setMensaje('Debe seleccionar una categoría');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        nombre: nombreEditando.trim(),
        id_categoria: parseInt(categoriaEditando) 
      };
      console.log('Actualizando con payload:', payload); 
      
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/subcategorias/${subcategoriaEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error del servidor:', errorText);
        throw new Error('Error al actualizar subcategoría');
      }
      
      const updatedSubcategoria = await res.json();
      console.log('Subcategoría actualizada:', updatedSubcategoria); 
      
      setMensaje('Subcategoría actualizada correctamente');
      setSubcategoriaEditando(null);
      setNombreEditando('');
      setCategoriaEditando('');
      setBusqueda('');
      cargarSubcategorias();
    } catch (error) {
      console.error('Error al actualizar subcategoría:', error);
      setMensaje('Error al actualizar subcategoría');
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setSubcategoriaEditando(null);
    setNombreEditando('');
    setCategoriaEditando('');
  };

  const eliminarSubcategoria = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta subcategoría?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/subcategorias/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar subcategoría');
      setMensaje('Subcategoría eliminada correctamente');
      setBusqueda('');
      cargarSubcategorias();
    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      setMensaje('Error al eliminar subcategoría');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar mensajes automáticamente luego de 3 seg
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Función para obtener el nombre de la categoría por ID
  const obtenerNombreCategoria = (idCategoria) => {
    // Buscar por id_categoria (para compatibilidad)
    const categoria = categorias.find(cat => 
      cat.id_categoria === idCategoria || cat.id === idCategoria
    );
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // Filtrar subcategorías según búsqueda
  const subcategoriasFiltradas = subcategorias.filter(({ nombre }) =>
    nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="categoria-management">
      <header className="categoria-header">
        <h2>Gestión de Subcategorías</h2>
      </header>

      {mensaje && (
        <p className={`mensaje ${mensaje.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {mensaje}
        </p>
      )}

      <form onSubmit={handleAgregar} className="categoria-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Nombre de la subcategoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
            required
          />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria || categoria.id} value={categoria.id_categoria || categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading || !nombre.trim() || !categoriaSeleccionada}>
            {loading ? 'Agregando...' : 'Agregar Subcategoría'}
          </button>
        </div>
      </form>

      <div className="categoria-lista">
        <h3>Subcategorías existentes</h3>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar subcategoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading && subcategorias.length === 0 ? (
          <p className="loading">Cargando subcategorías...</p>
        ) : subcategoriasFiltradas.length === 0 ? (
          <p className="no-data">No hay subcategorías que coincidan.</p>
        ) : (
          <div className="categoria-grid">
            {subcategoriasFiltradas.map((subcategoria) => {
              const categoriaId = subcategoria.idCategoria || subcategoria.id_categoria;
              return (
                <div className="categoria-card" key={subcategoria.id_subcategoria}>
                  <div className="categoria-info">
                    <span className="categoria-id">ID: {subcategoria.id_subcategoria}</span>
                    {subcategoriaEditando === subcategoria.id_subcategoria ? (
                      <>
                        <input
                          type="text"
                          value={nombreEditando}
                          onChange={(e) => setNombreEditando(e.target.value)}
                          disabled={loading}
                          className="categoria-edit"
                          placeholder="Nombre de la subcategoría"
                        />
                        <select
                          value={categoriaEditando}
                          onChange={(e) => setCategoriaEditando(e.target.value)}
                          disabled={loading}
                          className="categoria-edit"
                        >
                          <option value="">Selecciona una categoría</option>
                          {categorias.map((categoria) => (
                            <option key={categoria.id_categoria || categoria.id} value={categoria.id_categoria || categoria.id}>
                              {categoria.nombre}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <h4 className="categoria-nombre">{subcategoria.nombre}</h4>
                        <p className="categoria-parent">
                          Categoría: <strong>{obtenerNombreCategoria(categoriaId)}</strong>
                        </p>
                      </>
                    )}
                  </div>

                  <div className="categoria-actions">
                    {subcategoriaEditando === subcategoria.id_subcategoria ? (
                      <>
                        <button className="btn-save" onClick={guardarEdicion} disabled={loading}>
                          {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button className="btn-cancel" onClick={cancelarEdicion} disabled={loading}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => iniciarEdicion(subcategoria)}
                          disabled={loading}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => eliminarSubcategoria(subcategoria.id_subcategoria)}
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoriaManagement;