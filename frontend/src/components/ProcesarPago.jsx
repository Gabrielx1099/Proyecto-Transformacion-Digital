import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import '../css/ProcesarPago.css';

const ProcesarPago = () => {
  const navigate = useNavigate();
  const { limpiarCarrito } = useCarrito();
  
  // Estados principales
  const [datosFormulario, setDatosFormulario] = useState(null);
  const [metodoPago, setMetodoPago] = useState('');
  const [loading, setLoading] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados para formulario de tarjeta
  const [datosTarjeta, setDatosTarjeta] = useState({
    numeroTarjeta: '',
    nombreTarjeta: '',
    fechaVencimiento: '',
    cvv: '',
    tipoTarjeta: ''
  });
  
  // Estados para Yape/Plin
  const [numeroYapePlin, setNumeroYapePlin] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [mostrarQR, setMostrarQR] = useState(false);
  
  // Estado para resultado de la compra
  const [ventaCreada, setVentaCreada] = useState(null);

  useEffect(() => {
    // Cargar datos del formulario anterior
    const datos = localStorage.getItem('datosFormularioPago');
    if (!datos) {
      navigate('/');
      return;
    }
    
    setDatosFormulario(JSON.parse(datos));
  }, [navigate]);

  // Detectar tipo de tarjeta
  const detectarTipoTarjeta = (numero) => {
    const visa = /^4/;
    const mastercard = /^5[1-5]/;
    const amex = /^3[47]/;
    
    if (visa.test(numero)) return 'visa';
    if (mastercard.test(numero)) return 'mastercard';
    if (amex.test(numero)) return 'amex';
    return '';
  };

  // Manejar cambios en datos de tarjeta
  const handleTarjetaChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Formatear número de tarjeta
    if (name === 'numeroTarjeta') {
      newValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      const numero = value.replace(/\s/g, '');
      setDatosTarjeta(prev => ({
        ...prev,
        tipoTarjeta: detectarTipoTarjeta(numero)
      }));
    }
    
    // Formatear fecha de vencimiento
    if (name === 'fechaVencimiento') {
      newValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substr(0, 5);
    }
    
    // Limitar CVV
    if (name === 'cvv') {
      newValue = value.replace(/\D/g, '').substr(0, 4);
    }
    
    setDatosTarjeta(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario de tarjeta
  const validarTarjeta = () => {
    const newErrors = {};
    
    if (!datosTarjeta.numeroTarjeta.replace(/\s/g, '')) {
      newErrors.numeroTarjeta = 'Número de tarjeta requerido';
    } else if (datosTarjeta.numeroTarjeta.replace(/\s/g, '').length < 13) {
      newErrors.numeroTarjeta = 'Número de tarjeta inválido';
    }
    
    if (!datosTarjeta.nombreTarjeta.trim()) {
      newErrors.nombreTarjeta = 'Nombre del titular requerido';
    }
    
    if (!datosTarjeta.fechaVencimiento) {
      newErrors.fechaVencimiento = 'Fecha de vencimiento requerida';
    } else {
      const [mes, año] = datosTarjeta.fechaVencimiento.split('/');
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const añoActual = parseInt(fechaActual.getFullYear().toString().substr(-2));
      
      if (parseInt(mes) > 12 || parseInt(mes) < 1) {
        newErrors.fechaVencimiento = 'Mes inválido';
      } else if (parseInt(año) < añoActual || (parseInt(año) === añoActual && parseInt(mes) < mesActual)) {
        newErrors.fechaVencimiento = 'Tarjeta vencida';
      }
    }
    
    if (!datosTarjeta.cvv) {
      newErrors.cvv = 'CVV requerido';
    } else if (datosTarjeta.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar Yape/Plin
  const validarYapePlin = () => {
    const newErrors = {};
    
    if (!numeroYapePlin) {
      newErrors.numeroYapePlin = 'Número de teléfono requerido';
    } else if (!/^9\d{8}$/.test(numeroYapePlin)) {
      newErrors.numeroYapePlin = 'Número debe tener 9 dígitos y empezar con 9';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago con tarjeta
  const procesarPagoTarjeta = async () => {
    if (!validarTarjeta()) return;
    
    setProcesandoPago(true);
    
    try {
      // Simular procesamiento de pago con tarjeta
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Aquí integrarías con Culqi, Izipay u otro proveedor de pagos
      const pagoExitoso = Math.random() > 0.1; // 90% de éxito para demo
      
      if (pagoExitoso) {
        await finalizarCompra('tarjeta', {
          numeroTarjeta: datosTarjeta.numeroTarjeta.substr(-4),
          tipoTarjeta: datosTarjeta.tipoTarjeta
        });
      } else {
        throw new Error('El pago fue rechazado. Verifique los datos de su tarjeta.');
      }
      
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setErrors({ pago: error.message });
    } finally {
      setProcesandoPago(false);
    }
  };

  // Procesar pago con Yape/Plin
  const procesarPagoYapePlin = async () => {
    if (!validarYapePlin()) return;
    
    setMostrarQR(true);
    setProcesandoPago(true);
    
    try {
      // Simular tiempo de espera para confirmación
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const pagoExitoso = Math.random() > 0.05; // 95% de éxito para demo
      
      if (pagoExitoso) {
        await finalizarCompra(metodoPago, {
          numero: numeroYapePlin,
          operacion: `${metodoPago.toUpperCase()}-${Date.now()}`
        });
      } else {
        throw new Error('No se recibió la confirmación del pago. Intente nuevamente.');
      }
      
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setErrors({ pago: error.message });
      setMostrarQR(false);
    } finally {
      setProcesandoPago(false);
    }
  };

  // Finalizar compra
  const finalizarCompra = async (metodoPago, datosPago) => {
    try {
      const idUsuario = localStorage.getItem('idUsuario');
      // 1. Crear la venta
      const response = await fetch('http://localhost:8081/api/ventas/crear-desde-carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUsuario: parseInt(idUsuario),
          productos: datosFormulario.productos.map(p => ({
            id_producto: p.id_producto,
            cantidad: p.cantidad
          })),
          tipoComprobante: datosFormulario.tipoComprobante || 'boleta'
        })
      });

      if (response.ok) {
        const ventaCreada = await response.json();
        // 2. Procesar el pago
        const pagoBody = {
          metodoPago: metodoPago,
          datosCliente: {
            nombre: datosFormulario.nombre,
            apellidos: datosFormulario.apellidos,
            email: datosFormulario.email,
            telefono: datosFormulario.telefono,
            documento: datosFormulario.documento,
            tipoDocumento: datosFormulario.tipoDocumento,
            razonSocial: datosFormulario.razonSocial,
            ruc: datosFormulario.ruc,
            direccionFiscal: datosFormulario.direccionFiscal
          },
          datosEnvio: {
            direccion: datosFormulario.direccion,
            distrito: datosFormulario.distrito,
            provincia: datosFormulario.provincia,
            departamento: datosFormulario.departamento,
            codigoPostal: datosFormulario.codigoPostal,
            referencia: datosFormulario.referencia
          },
          ...(metodoPago === 'tarjeta' && {
            datosTarjeta: {
              numeroTarjeta: datosTarjeta.numeroTarjeta,
              nombreTarjeta: datosTarjeta.nombreTarjeta,
              fechaVencimiento: datosTarjeta.fechaVencimiento,
              cvv: datosTarjeta.cvv,
              tipoTarjeta: datosTarjeta.tipoTarjeta
            }
          }),
          ...(metodoPago === 'yape' && {
            datosYape: {
              numeroTelefono: numeroYapePlin
            }
          }),
          ...(metodoPago === 'plin' && {
            datosPlin: {
              numeroTelefono: numeroYapePlin
            }
          })
        };
        const pagoResponse = await fetch(`http://localhost:8081/api/ventas/${ventaCreada.idVenta}/procesar-pago`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pagoBody)
        });

        if (pagoResponse.ok) {
          const pagoResult = await pagoResponse.json();
          setVentaCreada(pagoResult.venta);
          setPagoCompletado(true);
          // Limpiar carrito
          await limpiarCarrito();
          // Limpiar datos del formulario
          localStorage.removeItem('datosFormularioPago');
        } else {
          throw new Error('Error al procesar el pago');
        }
      } else {
        throw new Error('Error al crear la venta');
      }
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      throw error;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  if (!datosFormulario) {
    return (
      <div className="procesar-pago-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Pantalla de pago completado
  if (pagoCompletado && ventaCreada) {
    return (
      <div className="procesar-pago-container">
        <div className="pago-completado">
          <div className="success-icon">✅</div>
          <h1>¡Compra Realizada con Éxito!</h1>
          <div className="venta-info">
            <h2>Orden #{ventaCreada.idVenta}</h2>
            <p>Total pagado: {formatPrice(datosFormulario.total)}</p>
            <p>Método de pago: {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</p>
          </div>
          <div className="info-envio">
            <h3>Información de Envío</h3>
            <p>{datosFormulario.nombre} {datosFormulario.apellidos}</p>
            <p>{datosFormulario.direccion}</p>
            <p>{datosFormulario.distrito}, {datosFormulario.provincia}</p>
            <p>Teléfono: {datosFormulario.telefono}</p>
          </div>
          <div className="acciones-finales">
            <p>Se ha enviado el comprobante a: <strong>{datosFormulario.email}</strong></p>
            <button 
              onClick={() => navigate(`/detalle-venta/${ventaCreada.idVenta}`)}
              className="btn-primary"
            >
              Ver Detalle de la Orden
            </button>
            <button 
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="procesar-pago-container">
      <div className="procesar-pago-content">
        {/* Header con progreso */}
        <div className="pago-header">
          <h1>Método de Pago</h1>
          <div className="progreso-compra">
            <div className="paso completado">1. Resumen</div>
            <div className="paso completado">2. Datos</div>
            <div className="paso activo">3. Pago</div>
          </div>
        </div>

        <div className="pago-layout">
          {/* Área principal de pago */}
          <div className="pago-principal">
            {/* Selección de método de pago */}
            <div className="metodos-pago">
              <h2>Selecciona tu método de pago</h2>
              
              <div className="metodo-option">
                <label className="metodo-label">
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    value="tarjeta"
                    checked={metodoPago === 'tarjeta'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  />
                  <div className="metodo-info">
                    <span className="metodo-icon">💳</span>
                    <div>
                      <strong>Tarjeta de Crédito/Débito</strong>
                      <small>Visa, Mastercard, American Express</small>
                    </div>
                  </div>
                </label>
              </div>

              <div className="metodo-option">
                <label className="metodo-label">
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    value="yape"
                    checked={metodoPago === 'yape'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  />
                  <div className="metodo-info">
                    <span className="metodo-icon">📱</span>
                    <div>
                      <strong>Yape</strong>
                      <small>Pago desde tu celular</small>
                    </div>
                  </div>
                </label>
              </div>

              <div className="metodo-option">
                <label className="metodo-label">
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    value="plin"
                    checked={metodoPago === 'plin'}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  />
                  <div className="metodo-info">
                    <span className="metodo-icon">💰</span>
                    <div>
                      <strong>Plin</strong>
                      <small>Pago desde tu celular</small>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Formulario de tarjeta */}
            {metodoPago === 'tarjeta' && (
              <div className="formulario-tarjeta">
                <h3>Datos de la Tarjeta</h3>
                <div className="tarjeta-preview">
                  <div className={`tarjeta-card ${datosTarjeta.tipoTarjeta}`}>
                    <div className="tarjeta-numero">
                      {datosTarjeta.numeroTarjeta || '•••• •••• •••• ••••'}
                    </div>
                    <div className="tarjeta-info">
                      <div className="tarjeta-nombre">
                        {datosTarjeta.nombreTarjeta || 'NOMBRE APELLIDO'}
                      </div>
                      <div className="tarjeta-fecha">
                        {datosTarjeta.fechaVencimiento || 'MM/AA'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="campos-tarjeta">
                  <div className="campo-grupo">
                    <label>Número de Tarjeta *</label>
                    <input 
                      type="text"
                      name="numeroTarjeta"
                      value={datosTarjeta.numeroTarjeta}
                      onChange={handleTarjetaChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={errors.numeroTarjeta ? 'error' : ''}
                    />
                    {errors.numeroTarjeta && <span className="error-message">{errors.numeroTarjeta}</span>}
                  </div>
                  
                  <div className="campo-grupo">
                    <label>Nombre del Titular *</label>
                    <input 
                      type="text"
                      name="nombreTarjeta"
                      value={datosTarjeta.nombreTarjeta}
                      onChange={handleTarjetaChange}
                      placeholder="Como aparece en la tarjeta"
                      className={errors.nombreTarjeta ? 'error' : ''}
                    />
                    {errors.nombreTarjeta && <span className="error-message">{errors.nombreTarjeta}</span>}
                  </div>
                  
                  <div className="campos-fila">
                    <div className="campo-grupo">
                      <label>Fecha de Vencimiento *</label>
                      <input 
                        type="text"
                        name="fechaVencimiento"
                        value={datosTarjeta.fechaVencimiento}
                        onChange={handleTarjetaChange}
                        placeholder="MM/AA"
                        maxLength="5"
                        className={errors.fechaVencimiento ? 'error' : ''}
                      />
                      {errors.fechaVencimiento && <span className="error-message">{errors.fechaVencimiento}</span>}
                    </div>
                    
                    <div className="campo-grupo">
                      <label>CVV *</label>
                      <input 
                        type="text"
                        name="cvv"
                        value={datosTarjeta.cvv}
                        onChange={handleTarjetaChange}
                        placeholder="123"
                        maxLength="4"
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario Yape/Plin */}
            {(metodoPago === 'yape' || metodoPago === 'plin') && (
              <div className="formulario-yape-plin">
                <h3>Pago con {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</h3>
                
                {!mostrarQR ? (
                  <div className="yape-plin-form">
                    <div className="campo-grupo">
                      <label>Número de teléfono *</label>
                      <input 
                        type="tel"
                        value={numeroYapePlin}
                        onChange={(e) => setNumeroYapePlin(e.target.value)}
                        placeholder="9XXXXXXXX"
                        maxLength="9"
                        className={errors.numeroYapePlin ? 'error' : ''}
                      />
                      {errors.numeroYapePlin && <span className="error-message">{errors.numeroYapePlin}</span>}
                    </div>
                    <div className="info-yape-plin">
                      <p>💡 Asegúrate de tener la app {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)} instalada y configurada</p>
                    </div>
                  </div>
                ) : (
                  <div className="qr-pago">
                    <div className="qr-container">
                      <div className="qr-code">
                        <div className="qr-placeholder">
                          <span>QR</span>
                        </div>
                      </div>
                      <p>Escanea este código QR desde tu app {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</p>
                      <div className="monto-qr">
                        <strong>{formatPrice(datosFormulario.total)}</strong>
                      </div>
                    </div>
                    <div className="instrucciones-qr">
                      <h4>Instrucciones:</h4>
                      <ol>
                        <li>Abre tu app {metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)}</li>
                        <li>Selecciona "Pagar con QR"</li>
                        <li>Escanea el código QR</li>
                        <li>Confirma el pago por {formatPrice(datosFormulario.total)}</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Errores de pago */}
            {errors.pago && (
              <div className="error-pago">
                <span className="error-icon">⚠️</span>
                <p>{errors.pago}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="acciones-pago">
              <button 
                onClick={() => navigate('/formulario-pago')}
                className="btn-secondary"
                disabled={procesandoPago}
              >
                Volver a Datos
              </button>
              
              <button 
                onClick={() => {
                  if (metodoPago === 'tarjeta') {
                    procesarPagoTarjeta();
                  } else if (metodoPago === 'yape' || metodoPago === 'plin') {
                    procesarPagoYapePlin();
                  }
                }}
                className="btn-primary"
                disabled={!metodoPago || procesandoPago}
              >
                {procesandoPago ? (
                  <>
                    <span className="spinner-small"></span>
                    {metodoPago === 'tarjeta' ? 'Procesando Pago...' : 'Esperando Confirmación...'}
                  </>
                ) : (
                  `Pagar ${formatPrice(datosFormulario.total)}`
                )}
              </button>
            </div>
          </div>

          {/* Resumen lateral */}
          <div className="resumen-lateral">
            <div className="resumen-card">
              <h3>Resumen de la Compra</h3>
              
              <div className="cliente-info">
                <h4>Datos del Cliente</h4>
                <p>{datosFormulario.nombre} {datosFormulario.apellidos}</p>
                <p>{datosFormulario.email}</p>
                <p>{datosFormulario.telefono}</p>
              </div>
              
              <div className="envio-info">
                <h4>Dirección de Envío</h4>
                <p>{datosFormulario.direccion}</p>
                <p>{datosFormulario.distrito}, {datosFormulario.provincia}</p>
              </div>
              
              <div className="productos-resumen">
                <h4>Productos ({datosFormulario.productos.length})</h4>
                {datosFormulario.productos.map((producto, index) => (
                  <div key={index} className="producto-resumen-item">
                    <div className="producto-resumen-info">
                      <span className="producto-nombre">{producto.nombre}</span>
                      <span className="producto-cantidad">x{producto.cantidad}</span>
                    </div>
                    <span className="producto-precio">
                      {formatPrice(producto.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="resumen-costos">
                <div className="costo-linea">
                  <span>Subtotal:</span>
                  <span>{formatPrice(datosFormulario.subtotal)}</span>
                </div>
                <div className="costo-linea">
                  <span>IGV (18%):</span>
                  <span>{formatPrice(datosFormulario.impuestos)}</span>
                </div>
                <div className="costo-linea">
                  <span>Envío:</span>
                  <span>{datosFormulario.envio > 0 ? formatPrice(datosFormulario.envio) : 'Gratis'}</span>
                </div>
                <div className="costo-linea total">
                  <span>Total:</span>
                  <span>{formatPrice(datosFormulario.total)}</span>
                </div>
              </div>
              
              <div className="comprobante-info">
                <h4>Comprobante</h4>
                <p>{datosFormulario.tipoComprobante === 'boleta' ? 'Boleta de Venta' : 'Factura'}</p>
                {datosFormulario.tipoComprobante === 'factura' && (
                  <>
                    <p>{datosFormulario.razonSocial}</p>
                    <p>RUC: {datosFormulario.ruc}</p>
                  </>
                )}
              </div>
              
              <div className="seguridad-info">
                <div className="seguridad-item">
                  <span className="seguridad-icon">🔒</span>
                  <small>Pago 100% seguro</small>
                </div>
                <div className="seguridad-item">
                  <span className="seguridad-icon">📧</span>
                  <small>Comprobante por email</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcesarPago;