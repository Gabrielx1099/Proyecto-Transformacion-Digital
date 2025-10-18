import React, { useState, useEffect } from 'react';
import '../css/Proveedores.css';

const ProveedoresManagement = () => {
  const [proveedores, setProveedores] = useState([]);
  const [nombreProveedor, setNombreProveedor] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ruc, setRuc] = useState('');
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [nombreProveedorEditando, setNombreProveedorEditando] = useState('');
  const [nombreEmpresaEditando, setNombreEmpresaEditando] = useState('');
  const [telefonoEditando, setTelefonoEditando] = useState('');
  const [rucEditando, setRucEditando] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const BACKEND_PORT = 8081;

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/proveedores`);
      if (!res.ok) throw new Error('Error al cargar proveedores');
      const data = await res.json();
      setProveedores(data);
    } catch {
      setMensaje('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nombreProveedor.trim() || !nombreEmpresa.trim() || !telefono.trim() || !ruc.trim()) {
      setMensaje('Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/proveedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_proveedor: nombreProveedor,
          nombre_empresa: nombreEmpresa,
          telefono: telefono,
          ruc: ruc
        }),
      });
      if (!res.ok) throw new Error('Error al agregar proveedor');
      setNombreProveedor('');
      setNombreEmpresa('');
      setTelefono('');
      setRuc('');
      setBusqueda('');
      setMensaje('Proveedor agregado correctamente');
      cargarProveedores();
    } catch {
      setMensaje('Error al agregar proveedor');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (proveedor) => {
    setProveedorEditando(proveedor.id_proveedor);
    setNombreProveedorEditando(proveedor.nombre_proveedor);
    setNombreEmpresaEditando(proveedor.nombre_empresa);
    setTelefonoEditando(proveedor.telefono);
    setRucEditando(proveedor.ruc);
  };

  const guardarEdicion = async () => {
    if (!nombreProveedorEditando.trim() || !nombreEmpresaEditando.trim() || !telefonoEditando.trim() || !rucEditando.trim()) {
      setMensaje('Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/proveedores/${proveedorEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_proveedor: nombreProveedorEditando,
          nombre_empresa: nombreEmpresaEditando,
          telefono: telefonoEditando,
          ruc: rucEditando
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar proveedor');
      setMensaje('Proveedor actualizado correctamente');
      setProveedorEditando(null);
      setNombreProveedorEditando('');
      setNombreEmpresaEditando('');
      setTelefonoEditando('');
      setRucEditando('');
      setBusqueda('');
      cargarProveedores();
    } catch {
      setMensaje('Error al actualizar proveedor');
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setProveedorEditando(null);
    setNombreProveedorEditando('');
    setNombreEmpresaEditando('');
    setTelefonoEditando('');
    setRucEditando('');
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este proveedor?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/proveedores/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar proveedor');
      setMensaje('Proveedor eliminado correctamente');
      setBusqueda('');
      cargarProveedores();
    } catch {
      setMensaje('Error al eliminar proveedor');
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

  const proveedoresFiltrados = proveedores.filter(({ nombre_proveedor, nombre_empresa, ruc }) =>
    nombre_proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    nombre_empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
    ruc.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="proveedores-management">
      <header className="proveedores-header">
        <h2>Gestión de Proveedores</h2>
      </header>

      {mensaje && (
        <p className={`mensaje ${mensaje.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {mensaje}
        </p>
      )}

      <form onSubmit={handleAgregar} className="proveedores-form">
        <div className="form-grid">
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre del Proveedor"
              value={nombreProveedor}
              onChange={(e) => setNombreProveedor(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre de la Empresa"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="RUC"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>
        <div className="button-container">
          <button type="submit" disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar Proveedor'}
          </button>
        </div>
      </form>

      <div className="proveedores-lista">
        <h3>Proveedores existentes</h3>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o RUC..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading && proveedores.length === 0 ? (
          <p className="loading">Cargando proveedores...</p>
        ) : proveedoresFiltrados.length === 0 ? (
          <p className="no-data">No hay proveedores que coincidan.</p>
        ) : (
          <div className="proveedores-grid">
            {proveedoresFiltrados.map(({ id_proveedor, nombre_proveedor, nombre_empresa, telefono, ruc }) => (
              <div className="proveedor-card" key={id_proveedor}>
                <div className="proveedor-info">
                  <span className="proveedor-id">ID: {id_proveedor}</span>
                  {proveedorEditando === id_proveedor ? (
                    <div className="proveedor-edit">
                      <input
                        type="text"
                        value={nombreProveedorEditando}
                        onChange={(e) => setNombreProveedorEditando(e.target.value)}
                        disabled={loading}
                        placeholder="Nombre del Proveedor"
                      />
                      <input
                        type="text"
                        value={nombreEmpresaEditando}
                        onChange={(e) => setNombreEmpresaEditando(e.target.value)}
                        disabled={loading}
                        placeholder="Nombre de la Empresa"
                      />
                      <input
                        type="text"
                        value={telefonoEditando}
                        onChange={(e) => setTelefonoEditando(e.target.value)}
                        disabled={loading}
                        placeholder="Teléfono"
                      />
                      <input
                        type="text"
                        value={rucEditando}
                        onChange={(e) => setRucEditando(e.target.value)}
                        disabled={loading}
                        placeholder="RUC"
                      />
                    </div>
                  ) : (
                    <div className="proveedor-details">
                      <h4 className="proveedor-nombre">{nombre_proveedor}</h4>
                      <p className="proveedor-empresa"><strong>Empresa:</strong> {nombre_empresa}</p>
                      <p className="proveedor-telefono"><strong>Teléfono:</strong> {telefono}</p>
                      <p className="proveedor-ruc"><strong>RUC:</strong> {ruc}</p>
                    </div>
                  )}
                </div>

                <div className="proveedor-actions">
                  {proveedorEditando === id_proveedor ? (
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
                        onClick={() => iniciarEdicion({ id_proveedor, nombre_proveedor, nombre_empresa, telefono, ruc })}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => eliminarProveedor(id_proveedor)}
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

export default ProveedoresManagement;