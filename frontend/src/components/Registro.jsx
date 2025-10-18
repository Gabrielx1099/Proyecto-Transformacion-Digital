import React, { useState, useEffect } from 'react';
import '../css/Registro.css'; // Importar el archivo CSS

function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('rol'));
  const [filtroRol, setFiltroRol] = useState('todos'); // Estado para el filtro
  const [errores, setErrores] = useState({});
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEditData, setFormEditData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [erroresEdit, setErroresEdit] = useState({});

  // Puerto backend Java
  const BACKEND_PORT = 8081;

  useEffect(() => {
    fetchUsuarios();
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('rol'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Efecto para filtrar usuarios cuando cambia el filtro o la lista de usuarios
  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, filtroRol]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/admin/usuarios`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        console.error('Error al obtener la lista de usuarios:', response.status);
      }
    } catch (error) {
      console.error('Error de red al obtener la lista de usuarios:', error);
    }
  };

  const filtrarUsuarios = () => {
    if (filtroRol === 'todos') {
      setUsuariosFiltrados(usuarios);
    } else {
      const filtrados = usuarios.filter(usuario => 
        usuario.rol.toLowerCase() === filtroRol.toLowerCase()
      );
      setUsuariosFiltrados(filtrados);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltroRol(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    // Validación de teléfono
    if (!/^9\d{8}$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos, solo números y empezar con 9';
    }
    // Validación de email
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nuevosErrores.email = 'El correo debe tener un formato válido';
    }
    // Validación de contraseña
    if (!/^(?=.*[A-Z]).{8,}$/.test(formData.password)) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres y una mayúscula';
    }
    // Confirmar contraseña
    if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    const nuevosErrores = validarFormulario();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/admin/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          contraseña: formData.password,
          confirmarcontraseña: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('Administrador registrado con éxito!');
        // Limpiar formulario
        setFormData({
          nombre: '',
          apellidos: '',
          email: '',
          telefono: '',
          direccion: '',
          password: '',
          confirmPassword: ''
        });
        setMostrarFormulario(false);
        // Recargar lista de usuarios
        fetchUsuarios();
      } else {
        setMensaje(data.message || 'Error al registrar administrador');
      }
    } catch (error) {
      console.error('Error al registrar administrador:', error);
      setMensaje('Error de conexión al registrar administrador.');
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/admin/usuarios/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje('Usuario eliminado correctamente');
        fetchUsuarios();
      } else {
        setMensaje(data.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      setMensaje('Error de conexión al eliminar usuario.');
    }
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormEditData({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
    });
    setErroresEdit({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormEditData(prev => ({ ...prev, [name]: value }));
  };

  const validarEditForm = () => {
    const nuevosErrores = {};
    if (!/^9\d{8}$/.test(formEditData.telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos, solo números y empezar con 9';
    }
    if (!/^\S+@\S+\.\S+$/.test(formEditData.email)) {
      nuevosErrores.email = 'El correo debe tener un formato válido';
    }
    if (!formEditData.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formEditData.apellidos) nuevosErrores.apellidos = 'Los apellidos son obligatorios';
    if (!formEditData.direccion) nuevosErrores.direccion = 'La dirección es obligatoria';
    return nuevosErrores;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarEditForm();
    setErroresEdit(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    try {
      const response = await fetch(`http://localhost:${BACKEND_PORT}/api/admin/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEditData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje('Usuario editado correctamente');
        setUsuarioEditando(null);
        fetchUsuarios();
      } else {
        setMensaje(data.message || 'Error al editar usuario');
      }
    } catch (error) {
      setMensaje('Error de conexión al editar usuario.');
    }
  };

  const handleCerrarEdit = () => {
    setUsuarioEditando(null);
  };

  return (
    <div className="registro-container">
      <h2>Gestión de Administradores</h2>

      {!mostrarFormulario && (
        <div>
          <div className="controls-section">
            <button onClick={() => setMostrarFormulario(true)}>
              Registrar Nuevo Administrador
            </button>
            
            <div className="filtro-container">
              <label htmlFor="filtro-rol">Filtrar por rol:</label>
              <select 
                id="filtro-rol"
                value={filtroRol} 
                onChange={handleFiltroChange}
                className="filtro-select"
              >
                <option value="todos">Todos los usuarios</option>
                <option value="admin">Administradores</option>
                <option value="cliente">Clientes</option>
              </select>
            </div>
          </div>

          <h3>
            Lista de Usuarios 
            {filtroRol !== 'todos' && (
              <span className="filtro-activo">
                - Mostrando: {filtroRol === 'admin' ? 'Administradores' : 'Clientes'}
              </span>
            )}
          </h3>
          
          {usuariosFiltrados.length > 0 ? (
            <div className="tabla-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id}>
                      <td>{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.apellidos}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.telefono}</td>
                      <td>
                        <span className={`rol-badge ${usuario.rol.toLowerCase()}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td>{new Date(usuario.fechacreacion).toLocaleDateString()}</td>
                      <td>
                        <button className="editar-btn" onClick={() => handleEditarUsuario(usuario)}>
                          Editar
                        </button>
                        <button className="eliminar-btn" onClick={() => handleEliminarUsuario(usuario.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-usuarios">
              {filtroRol === 'todos' 
                ? 'No hay usuarios registrados.' 
                : `No hay usuarios con rol "${filtroRol === 'admin' ? 'Administrador' : 'Cliente'}" registrados.`
              }
            </p>
          )}
        </div>
      )}

      {mostrarFormulario && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="form-modal">
            <button 
              type="button" 
              className="close-button"
              onClick={() => setMostrarFormulario(false)}
            >
              ✕
            </button>
            
            <h2>Registrar Nuevo Administrador</h2>
            
            <div className="form-grid">
              <div className="input-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre} 
                  onChange={handleChange} 
                  placeholder="Nombres"
                  required 
                />
              </div>
              
              <div className="input-group">
                <label>Apellidos:</label>
                <input 
                  type="text" 
                  name="apellidos"
                  value={formData.apellidos} 
                  onChange={handleChange}
                  placeholder="Apellidos" 
                  required 
                />
              </div>
              
              <div className="input-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="Correo Electrónico" 
                  required 
                />
                {errores.email && <span className="error-message">{errores.email}</span>}
              </div>
              
              <div className="input-group">
                <label>Teléfono:</label>
                <input 
                  type="text" 
                  name="telefono"
                  value={formData.telefono} 
                  onChange={handleChange}
                  placeholder="Teléfono" 
                  required 
                />
                {errores.telefono && <span className="error-message">{errores.telefono}</span>}
              </div>
              
              <div className="input-group full-width">
                <label>Dirección:</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={formData.direccion} 
                  onChange={handleChange}
                  placeholder="Dirección" 
                  required 
                />
              </div>
              
              <div className="input-group">
                <label>Contraseña:</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="Contraseña" 
                  required 
                />
                {errores.password && <span className="error-message">{errores.password}</span>}
              </div>
              
              <div className="input-group">
                <label>Confirmar Contraseña:</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  placeholder="Confirmar Contraseña" 
                  required 
                />
                {errores.confirmPassword && <span className="error-message">{errores.confirmPassword}</span>}
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="submit-button">
                Registrar Administrador
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {usuarioEditando && (
        <div className="form-overlay">
          <form onSubmit={handleEditSubmit} className="form-modal">
            <button type="button" className="close-button" onClick={handleCerrarEdit}>✕</button>
            <h2>Editar Usuario</h2>
            <div className="form-grid">
              <div className="input-group">
                <label>Nombre:</label>
                <input type="text" name="nombre" value={formEditData.nombre} onChange={handleEditChange} required />
                {erroresEdit.nombre && <span className="error-message">{erroresEdit.nombre}</span>}
              </div>
              <div className="input-group">
                <label>Apellidos:</label>
                <input type="text" name="apellidos" value={formEditData.apellidos} onChange={handleEditChange} required />
                {erroresEdit.apellidos && <span className="error-message">{erroresEdit.apellidos}</span>}
              </div>
              <div className="input-group">
                <label>Email:</label>
                <input type="email" name="email" value={formEditData.email} onChange={handleEditChange} required />
                {erroresEdit.email && <span className="error-message">{erroresEdit.email}</span>}
              </div>
              <div className="input-group">
                <label>Teléfono:</label>
                <input type="text" name="telefono" value={formEditData.telefono} onChange={handleEditChange} required />
                {erroresEdit.telefono && <span className="error-message">{erroresEdit.telefono}</span>}
              </div>
              <div className="input-group full-width">
                <label>Dirección:</label>
                <input type="text" name="direccion" value={formEditData.direccion} onChange={handleEditChange} required />
                {erroresEdit.direccion && <span className="error-message">{erroresEdit.direccion}</span>}
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Guardar Cambios</button>
              <button type="button" className="cancel-button" onClick={handleCerrarEdit}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {mensaje && (
        <div className={`mensaje ${mensaje.includes('éxito') ? 'success-message' : 'error-message'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}

export default Registro;