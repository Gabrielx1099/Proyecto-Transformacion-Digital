import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import '../css/FormularioPago.css';

const FormularioPago = () => {
  const navigate = useNavigate();
  const { carrito, detalles, total } = useCarrito();
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    // Datos del cliente
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    documento: '',
    tipoDocumento: 'DNI',
    
    // Dirección de envío
    direccion: '',
    distrito: '',
    provincia: 'Callao',
    departamento: 'Lima',
    codigoPostal: '',
    referencia: '',
    
    // Tipo de comprobante
    tipoComprobante: 'boleta', // boleta o factura
    
    // Para factura
    razonSocial: '',
    ruc: '',
    direccionFiscal: '',
    
    // Términos y condiciones
    aceptaTerminos: false,
    recibirPromociones: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usuario, setUsuario] = useState(null);

  // Calcular costos
  const subtotal = total || 0;
  const impuestos = subtotal * 0.18;
  const envio = subtotal > 100 ? 0 : 15.00;
  const totalConImpuestos = subtotal + impuestos + envio;

  // Distritos del Callao
  const distritosCallao = [
    'Bellavista', 'Callao', 'Carmen de la Legua Reynoso', 
    'La Perla', 'La Punta', 'Mi Perú', 'Ventanilla'
  ];

  useEffect(() => {
    // Verificar si hay productos en el carrito
    if (!detalles || detalles.length === 0) {
      navigate('/');
      return;
    }

    // Cargar datos del usuario si está logueado
    const cargarDatosUsuario = async () => {
      const idUsuario = localStorage.getItem('idUsuario');
      if (idUsuario) {
        try {
          const response = await fetch(`http://localhost:8081/api/usuarios/${idUsuario}`);
          if (response.ok) {
            const userData = await response.json();
            setUsuario(userData);
            setFormData(prev => ({
              ...prev,
              nombre: userData.nombre || '',
              apellidos: userData.apellidos || '',
              email: userData.email || '',
              telefono: userData.telefono || '',
              direccion: userData.direccion || ''
            }));
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
        }
      }
    };

    cargarDatosUsuario();
  }, [detalles, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.documento.trim()) newErrors.documento = 'El documento es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.distrito.trim()) newErrors.distrito = 'El distrito es requerido';

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar teléfono (Perú - 9 dígitos)
    const telefonoRegex = /^9\d{8}$/;
    if (formData.telefono && !telefonoRegex.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono debe tener 9 dígitos y empezar con 9';
    }

    // Validar documento según tipo
    if (formData.tipoDocumento === 'DNI') {
      const dniRegex = /^\d{8}$/;
      if (formData.documento && !dniRegex.test(formData.documento)) {
        newErrors.documento = 'DNI debe tener 8 dígitos';
      }
    } else if (formData.tipoDocumento === 'CE') {
      const ceRegex = /^\d{9}$/;
      if (formData.documento && !ceRegex.test(formData.documento)) {
        newErrors.documento = 'Carnet de extranjería debe tener 9 dígitos';
      }
    }

    // Validaciones para factura
    if (formData.tipoComprobante === 'factura') {
      if (!formData.razonSocial.trim()) newErrors.razonSocial = 'La razón social es requerida';
      if (!formData.ruc.trim()) newErrors.ruc = 'El RUC es requerido';
      if (!formData.direccionFiscal.trim()) newErrors.direccionFiscal = 'La dirección fiscal es requerida';
      
      // Validar RUC (11 dígitos)
      const rucRegex = /^\d{11}$/;
      if (formData.ruc && !rucRegex.test(formData.ruc)) {
        newErrors.ruc = 'RUC debe tener 11 dígitos';
      }
    }

    // Validar términos y condiciones
    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para enviar al backend
      const datosFormulario = {
        ...formData,
        subtotal,
        impuestos,
        envio,
        total: totalConImpuestos,
        productos: detalles.map(item => ({
          id_producto: item.id_producto,
          nombre: item.producto?.nombre,
          precio: item.producto?.precio,
          cantidad: item.cantidad,
          subtotal: (item.producto?.precio || 0) * item.cantidad
        }))
      };

      // Guardar datos en localStorage para el siguiente paso
      localStorage.setItem('datosFormularioPago', JSON.stringify(datosFormulario));
      
      // Navegar a la página de procesamiento de pago
      navigate('/procesar-pago');
      
    } catch (error) {
      console.error('Error al procesar formulario:', error);
      alert('Hubo un error al procesar el formulario. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  return (
    <div className="formulario-pago-container">
      <div className="formulario-pago-content">
        {/* Header con progreso */}
        <div className="formulario-header">
          <h1>Información de Entrega y Facturación</h1>
          <div className="progreso-compra">
            <div className="paso completado">1. Resumen</div>
            <div className="paso activo">2. Datos</div>
            <div className="paso">3. Pago</div>
          </div>
        </div>

        <div className="formulario-layout">
          {/* Formulario principal */}
          <div className="formulario-principal">
            <form onSubmit={handleSubmit}>
              {/* Datos del cliente */}
              <div className="seccion-formulario">
                <h2>📋 Datos del Cliente</h2>
                <div className="campos-grid">
                  <div className="campo-grupo">
                    <label>Nombres *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={errors.nombre ? 'error' : ''}
                    />
                    {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                  </div>

                  <div className="campo-grupo">
                    <label>Apellidos *</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      className={errors.apellidos ? 'error' : ''}
                    />
                    {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
                  </div>

                  <div className="campo-grupo">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="campo-grupo">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="9XXXXXXXX"
                      className={errors.telefono ? 'error' : ''}
                    />
                    {errors.telefono && <span className="error-message">{errors.telefono}</span>}
                  </div>

                  <div className="campo-grupo">
                    <label>Tipo de Documento *</label>
                    <select
                      name="tipoDocumento"
                      value={formData.tipoDocumento}
                      onChange={handleInputChange}
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">Carnet de Extranjería</option>
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label>Número de Documento *</label>
                    <input
                      type="text"
                      name="documento"
                      value={formData.documento}
                      onChange={handleInputChange}
                      placeholder={formData.tipoDocumento === 'DNI' ? '12345678' : '123456789'}
                      className={errors.documento ? 'error' : ''}
                    />
                    {errors.documento && <span className="error-message">{errors.documento}</span>}
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="seccion-formulario">
                <h2>🚚 Dirección de Envío</h2>
                <div className="campos-grid">
                  <div className="campo-grupo campo-completo">
                    <label>Dirección *</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Av. Ejemplo 123"
                      className={errors.direccion ? 'error' : ''}
                    />
                    {errors.direccion && <span className="error-message">{errors.direccion}</span>}
                  </div>

                  <div className="campo-grupo">
                    <label>Distrito *</label>
                    <select
                      name="distrito"
                      value={formData.distrito}
                      onChange={handleInputChange}
                      className={errors.distrito ? 'error' : ''}
                    >
                      <option value="">Seleccionar distrito</option>
                      {distritosCallao.map(distrito => (
                        <option key={distrito} value={distrito}>{distrito}</option>
                      ))}
                    </select>
                    {errors.distrito && <span className="error-message">{errors.distrito}</span>}
                  </div>

                  <div className="campo-grupo">
                    <label>Provincia</label>
                    <input
                      type="text"
                      name="provincia"
                      value={formData.provincia}
                      readOnly
                      className="readonly"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label>Departamento</label>
                    <input
                      type="text"
                      name="departamento"
                      value={formData.departamento}
                      readOnly
                      className="readonly"
                    />
                  </div>

                  <div className="campo-grupo">
                    <label>Código Postal</label>
                    <input
                      type="text"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      placeholder="07001"
                    />
                  </div>

                  <div className="campo-grupo campo-completo">
                    <label>Referencia</label>
                    <input
                      type="text"
                      name="referencia"
                      value={formData.referencia}
                      onChange={handleInputChange}
                      placeholder="Frente al parque, casa verde"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de comprobante */}
              <div className="seccion-formulario">
                <h2>🧾 Tipo de Comprobante</h2>
                <div className="tipo-comprobante-selector">
                  <label className="comprobante-option">
                    <input
                      type="radio"
                      name="tipoComprobante"
                      value="boleta"
                      checked={formData.tipoComprobante === 'boleta'}
                      onChange={handleInputChange}
                    />
                    <span className="comprobante-info">
                      <strong>Boleta de Venta</strong>
                      <small>Para personas naturales</small>
                    </span>
                  </label>

                  <label className="comprobante-option">
                    <input
                      type="radio"
                      name="tipoComprobante"
                      value="factura"
                      checked={formData.tipoComprobante === 'factura'}
                      onChange={handleInputChange}
                    />
                    <span className="comprobante-info">
                      <strong>Factura</strong>
                      <small>Para empresas (permite deducir gastos)</small>
                    </span>
                  </label>
                </div>

                {/* Campos adicionales para factura */}
                {formData.tipoComprobante === 'factura' && (
                  <div className="campos-factura">
                    <div className="campos-grid">
                      <div className="campo-grupo campo-completo">
                        <label>Razón Social *</label>
                        <input
                          type="text"
                          name="razonSocial"
                          value={formData.razonSocial}
                          onChange={handleInputChange}
                          className={errors.razonSocial ? 'error' : ''}
                        />
                        {errors.razonSocial && <span className="error-message">{errors.razonSocial}</span>}
                      </div>

                      <div className="campo-grupo">
                        <label>RUC *</label>
                        <input
                          type="text"
                          name="ruc"
                          value={formData.ruc}
                          onChange={handleInputChange}
                          placeholder="12345678901"
                          className={errors.ruc ? 'error' : ''}
                        />
                        {errors.ruc && <span className="error-message">{errors.ruc}</span>}
                      </div>

                      <div className="campo-grupo campo-completo">
                        <label>Dirección Fiscal *</label>
                        <input
                          type="text"
                          name="direccionFiscal"
                          value={formData.direccionFiscal}
                          onChange={handleInputChange}
                          className={errors.direccionFiscal ? 'error' : ''}
                        />
                        {errors.direccionFiscal && <span className="error-message">{errors.direccionFiscal}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="seccion-formulario">
                <div className="terminos-condiciones">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleInputChange}
                      className={errors.aceptaTerminos ? 'error' : ''}
                    />
                    <span>Acepto los <a href="/terminos" target="_blank">términos y condiciones</a> *</span>
                  </label>
                  {errors.aceptaTerminos && <span className="error-message">{errors.aceptaTerminos}</span>}

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="recibirPromociones"
                      checked={formData.recibirPromociones}
                      onChange={handleInputChange}
                    />
                    <span>Deseo recibir promociones y ofertas por email</span>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="acciones-formulario">
                <button
                  type="button"
                  onClick={() => navigate('/detalle-venta/nuevo')}
                  className="btn-secondary"
                >
                  Volver al Resumen
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Continuar al Pago'}
                </button>
              </div>
            </form>
          </div>

          {/* Resumen lateral */}
          <div className="resumen-lateral">
            <div className="resumen-card">
              <h3>Resumen de la Compra</h3>
              
              <div className="productos-resumen">
                {detalles.map((item) => (
                  <div key={item.id_detalle} className="producto-resumen-item">
                    <div className="producto-resumen-info">
                      <span className="producto-nombre">{item.producto?.nombre}</span>
                      <span className="producto-cantidad">x{item.cantidad}</span>
                    </div>
                    <span className="producto-precio">
                      {formatPrice((item.producto?.precio || 0) * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="resumen-costos">
                <div className="costo-linea">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="costo-linea">
                  <span>IGV (18%):</span>
                  <span>{formatPrice(impuestos)}</span>
                </div>
                <div className="costo-linea">
                  <span>Envío:</span>
                  <span>{envio > 0 ? formatPrice(envio) : 'Gratis'}</span>
                </div>
                <div className="costo-linea total">
                  <span>Total:</span>
                  <span>{formatPrice(totalConImpuestos)}</span>
                </div>
              </div>

              <div className="info-adicional">
                <div className="info-item">
                  <span className="info-icon">🚚</span>
                  <div>
                    <strong>Envío:</strong>
                    <small>2-3 días hábiles</small>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔒</span>
                  <div>
                    <strong>Seguridad:</strong>
                    <small>Compra 100% segura</small>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">↩️</span>
                  <div>
                    <strong>Devoluciones:</strong>
                    <small>30 días para cambios</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioPago;