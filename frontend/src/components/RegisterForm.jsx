import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/RegisterForm.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

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
    setError('');
    const nuevosErrores = validarFormulario();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/auth/registrar', {
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
        // Redirigir a la página de verificación con el email
        navigate('/verificar-codigo', { 
          state: { 
            email: formData.email,
            mensaje: 'Se ha enviado un código de verificación a tu correo electrónico.'
          }
        });
      } else {
        setError(data.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="apellidos">Apellidos</label>
          <input
            type="text"
            id="apellidos"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errores.email && <span className="error-message">{errores.email}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errores.telefono && <span className="error-message">{errores.telefono}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errores.password && <span className="error-message">{errores.password}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errores.confirmPassword && <span className="error-message">{errores.confirmPassword}</span>}
        </div>
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm; 