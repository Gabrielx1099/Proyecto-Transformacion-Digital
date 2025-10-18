import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/VerificacionCodigo.css';

const VerificacionCodigo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Verificar si hay un email en el estado de la ubicación
    if (!location.state?.email) {
      navigate('/registrar');
      return;
    }

    // Mostrar mensaje de éxito si existe
    if (location.state?.mensaje) {
      setMensaje(location.state.mensaje);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Enviando código de verificación:', {
        email: location.state?.email,
        codigo: codigo
      });

      const response = await fetch('http://localhost:8081/api/auth/verificar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: location.state?.email,
          codigo: codigo
        }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (response.ok) {
        navigate('/login', { 
          state: { 
            mensaje: '¡Cuenta verificada exitosamente! Por favor inicia sesión.' 
          }
        });
      } else {
        setError(data.message || 'Error al verificar el código');
      }
    } catch (err) {
      console.error('Error al verificar código:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verificacion-container">
      <form className="verificacion-form" onSubmit={handleSubmit}>
        <h2>Verificación de Email</h2>
        {mensaje && <div className="success-message">{mensaje}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="codigo">Código de Verificación</label>
          <input
            type="text"
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ingresa el código enviado a tu email"
            required
            disabled={loading}
            maxLength={6}
            pattern="[0-9]{6}"
            title="El código debe ser de 6 dígitos"
          />
        </div>

        <button type="submit" className="verificar-button" disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar Código'}
        </button>
      </form>
    </div>
  );
};

export default VerificacionCodigo; 