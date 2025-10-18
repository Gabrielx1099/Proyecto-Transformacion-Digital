import React, { useState, useEffect } from 'react';
import '../css/Marca.css'; // Reutiliza el mismo CSS que categorías

const MarcaManagement = () => {
  const [marcas, setMarcas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [marcaEditando, setMarcaEditando] = useState(null);
  const [nombreEditando, setNombreEditando] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const BACKEND_PORT = 8081;

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/marcas`);
      if (!res.ok) throw new Error('Error al cargar marcas');
      const data = await res.json();
      setMarcas(data);
    } catch {
      setMensaje('Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMensaje('El nombre de la marca es requerido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/marcas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error('Error al agregar marca');
      setNombre('');
      setBusqueda('');
      setMensaje('Marca agregada correctamente');
      cargarMarcas();
    } catch {
      setMensaje('Error al agregar marca');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (marca) => {
    setMarcaEditando(marca.id_marca);
    setNombreEditando(marca.nombre);
  };

  const guardarEdicion = async () => {
    if (!nombreEditando.trim()) {
      setMensaje('El nombre de la marca es requerido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/marcas/${marcaEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreEditando }),
      });
      if (!res.ok) throw new Error('Error al actualizar marca');
      setMensaje('Marca actualizada correctamente');
      setMarcaEditando(null);
      setNombreEditando('');
      setBusqueda('');
      cargarMarcas();
    } catch {
      setMensaje('Error al actualizar marca');
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setMarcaEditando(null);
    setNombreEditando('');
  };

  const eliminarMarca = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta marca?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/marcas/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar marca');
      setMensaje('Marca eliminada correctamente');
      setBusqueda('');
      cargarMarcas();
    } catch {
      setMensaje('Error al eliminar marca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const marcasFiltradas = marcas.filter(({ nombre }) =>
    nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="categoria-management">
      <header className="categoria-header">
        <h2>Gestión de Marcas</h2>
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
            placeholder="Nombre de la marca"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading || !nombre.trim()}>
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>

      <div className="categoria-lista">
        <h3>Marcas existentes</h3>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading && marcas.length === 0 ? (
          <p className="loading">Cargando marcas...</p>
        ) : marcasFiltradas.length === 0 ? (
          <p className="no-data">No hay marcas que coincidan.</p>
        ) : (
          <div className="categoria-grid">
            {marcasFiltradas.map(({ id_marca, nombre }) => (
              <div className="categoria-card" key={id_marca}>
                <div className="categoria-info">
                  <span className="categoria-id">ID: {id_marca}</span>
                  {marcaEditando === id_marca ? (
                    <input
                      type="text"
                      value={nombreEditando}
                      onChange={(e) => setNombreEditando(e.target.value)}
                      disabled={loading}
                      className="categoria-edit"
                    />
                  ) : (
                    <h4 className="categoria-nombre">{nombre}</h4>
                  )}
                </div>

                <div className="categoria-actions">
                  {marcaEditando === id_marca ? (
                    <>
                      <button className="btn-save" onClick={guardarEdicion} disabled={loading}>
                        Guardar
                      </button>
                      <button className="btn-cancel" onClick={cancelarEdicion} disabled={loading}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => iniciarEdicion({ id_marca, nombre })}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => eliminarMarca(id_marca)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarcaManagement;
