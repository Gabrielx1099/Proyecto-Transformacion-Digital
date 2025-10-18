import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import '../css/DetalleVenta.css';

const DetalleVenta = () => {
    const { idVenta } = useParams();
    const navigate = useNavigate();
    const { 
        carrito, 
        detalles, 
        total, 
        fetchCarrito, 
        handleAumentarCantidad,
        handleDisminuirCantidad, 
        eliminarDetalle 
    } = useCarrito();
    
    const [loading, setLoading] = useState(true);
    const [ventaExistente, setVentaExistente] = useState(null);

    // Calcular costos
    const subtotal = total || 0;
    const impuestos = subtotal * 0.18;
    const envio = subtotal > 100 ? 0 : 15.00;
    const totalConImpuestos = subtotal + impuestos + envio;

    // Función para calcular total de venta existente
    const calcularTotalVentaExistente = (detallesVenta) => {
        if (!detallesVenta || !Array.isArray(detallesVenta)) return 0;
        
        return detallesVenta.reduce((total, detalle) => {
            const precio = detalle.producto?.precio || 0;
            const cantidad = detalle.cantidad || 0;
            return total + (precio * cantidad);
        }, 0);
    };

    useEffect(() => {
        const inicializarDetalle = async () => {
            const idUsuario = localStorage.getItem('idUsuario');
            
            if (!idUsuario) {
                navigate('/login');
                return;
            }

            // Caso 1: Nueva venta desde carrito
            if (idVenta === 'nuevo') {
                try {
                    await fetchCarrito(parseInt(idUsuario));
                    setLoading(false);
                } catch (error) {
                    console.error('Error al cargar carrito:', error);
                    navigate('/');
                }
                return;
            }

            // Caso 2: Venta existente con ID numérico
            if (idVenta && idVenta !== 'nuevo') {
                try {
                    const response = await fetch(`http://localhost:8081/api/ventas/${idVenta}`);
                    if (response.ok) {
                        const venta = await response.json();
                        
                        // Calcular el total correcto si no viene desde el backend
                        if (!venta.total || venta.total === 0) {
                            venta.total = calcularTotalVentaExistente(venta.detalles);
                        }
                        
                        setVentaExistente(venta);
                    } else {
                        console.error('Venta no encontrada');
                        // Si no encuentra la venta, cargar carrito actual
                        await fetchCarrito(parseInt(idUsuario));
                    }
                } catch (error) {
                    console.error('Error al cargar venta:', error);
                    // En caso de error, cargar carrito actual
                    await fetchCarrito(parseInt(idUsuario));
                }
                setLoading(false);
                return;
            }

            // Caso 3: Sin ID - cargar carrito actual
            try {
                await fetchCarrito(parseInt(idUsuario));
            } catch (error) {
                console.error('Error al cargar carrito:', error);
                navigate('/');
            }
            setLoading(false);
        };

        inicializarDetalle();
    }, [idVenta, navigate, fetchCarrito]);

    // Verificar si el carrito está vacío después de cargar
    useEffect(() => {
        if (!loading && !ventaExistente && detalles.length === 0) {
            navigate('/');
        }
    }, [loading, ventaExistente, detalles.length, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(price);
    };

    const handleContinuar = () => {
        if (!ventaExistente && detalles.length > 0) {
            navigate('/formulario-pago');
        }
    };

    const handleEditarCantidad = async (idDetalle, nuevaCantidad, cantidadActual) => {
        if (nuevaCantidad > cantidadActual) {
            await handleAumentarCantidad(idDetalle, cantidadActual);
        } else if (nuevaCantidad < cantidadActual) {
            await handleDisminuirCantidad(idDetalle, cantidadActual);
        }
    };

    const handleEliminarProducto = async (idDetalle) => {
        await eliminarDetalle(idDetalle);
    };

    // Funciones para manejar edición en ventas existentes PENDIENTES
    const handleEditarCantidadVenta = async (idDetalle, nuevaCantidad, cantidadActual) => {
        try {
            const response = await fetch(`http://localhost:8081/api/detalles-venta/${idDetalle}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cantidad: nuevaCantidad
                }),
            });

            if (response.ok) {
                // Recargar la venta para mostrar cambios
                const ventaResponse = await fetch(`http://localhost:8081/api/ventas/${idVenta}`);
                if (ventaResponse.ok) {
                    const ventaActualizada = await ventaResponse.json();
                    // Recalcular total si es necesario
                    if (!ventaActualizada.total || ventaActualizada.total === 0) {
                        ventaActualizada.total = calcularTotalVentaExistente(ventaActualizada.detalles);
                    }
                    setVentaExistente(ventaActualizada);
                }
            } else {
                console.error('Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEliminarProductoVenta = async (idDetalle) => {
        try {
            const response = await fetch(`http://localhost:8081/api/detalles-venta/${idDetalle}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Recargar la venta para mostrar cambios
                const ventaResponse = await fetch(`http://localhost:8081/api/ventas/${idVenta}`);
                if (ventaResponse.ok) {
                    const ventaActualizada = await ventaResponse.json();
                    
                    // Si no quedan productos, redirigir al inicio
                    if (!ventaActualizada.detalles || ventaActualizada.detalles.length === 0) {
                        navigate('/');
                        return;
                    }
                    
                    // Recalcular total si es necesario
                    if (!ventaActualizada.total || ventaActualizada.total === 0) {
                        ventaActualizada.total = calcularTotalVentaExistente(ventaActualizada.detalles);
                    }
                    setVentaExistente(ventaActualizada);
                }
            } else {
                console.error('Error al eliminar producto');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="detalle-venta-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando detalles...</p>
                </div>
            </div>
        );
    }

// Si es una venta existente
if (ventaExistente) {
  return (
    <div className="detalle-venta-container">
      <div className="detalle-venta-card">
        <div className="detalle-header">
          <h1>Detalle de Venta #{ventaExistente.idVenta}</h1>
          <div className="fecha-venta">
            {new Date(ventaExistente.fecha).toLocaleDateString('es-PE')}
          </div>
          {/* Mostrar estado de la venta */}
          <div className={`estado-venta ${ventaExistente.estado.toLowerCase()}`}>
            Estado: {ventaExistente.estado}
          </div>
        </div>
        
        <div className="productos-section">
          <h2>Productos Comprados</h2>
          <div className="productos-lista">
            {ventaExistente.detalles.map((detalle) => (
              <div key={detalle.id_detalle} className="producto-item">
                <div className="producto-imagen">
                  <img 
                    src={detalle.producto.imagen || '/images/default-product.jpg'} 
                    alt={detalle.producto.nombre}
                    onError={(e) => { e.target.src = '/images/default-product.jpg'; }}
                  />
                </div>
                <div className="producto-info">
                  <h3>{detalle.producto.nombre}</h3>
                  <p>{detalle.producto.descripcion}</p>
                  <div className="producto-detalles">
                    <span className="precio-unitario">
                      {formatPrice(detalle.producto.precio)} c/u
                    </span>
                    <span className="cantidad">
                      Cantidad: {detalle.cantidad}
                    </span>
                  </div>
                </div>
                <div className="producto-total">
                  {formatPrice(detalle.producto.precio * detalle.cantidad)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="resumen-total">
          <div className="total-final">
            <h3>Total: {formatPrice(ventaExistente.total)}</h3>
          </div>
        </div>
        
        <div className="acciones">
          <button 
            onClick={() => navigate('/')} 
            className="btn-secondary"
          >
            Volver al Inicio
          </button>
          
          {/* Mostrar botón de continuar solo si la venta está pendiente */}
          {ventaExistente.estado === 'PENDIENTE' && (
            <button 
              onClick={() => navigate(`/formulario-pago?ventaId=${ventaExistente.idVenta}`)}
              className="btn-primary"
            >
              Continuar con el Pago
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

    // Nueva venta desde carrito
    return (
        <div className="detalle-venta-container">
            <div className="detalle-venta-card">
                <div className="detalle-header">
                    <h1>Resumen de tu Compra</h1>
                    <div className="progreso-compra">
                        <div className="paso activo">1. Resumen</div>
                        <div className="paso">2. Datos</div>
                        <div className="paso">3. Pago</div>
                    </div>
                </div>

                <div className="productos-section">
                    <h2>Productos en tu carrito</h2>
                    <div className="productos-lista">
                        {detalles.map((item) => (
                            <div key={item.id_detalle} className="producto-item editable">
                                <div className="producto-imagen">
                                    <img 
                                        src={item.producto?.imagen || '/images/default-product.jpg'} 
                                        alt={item.producto?.nombre || 'Producto'}
                                        onError={(e) => { e.target.src = '/images/default-product.jpg'; }}
                                    />
                                </div>
                                <div className="producto-info">
                                    <h3>{item.producto?.nombre || 'Producto'}</h3>
                                    <p>{item.producto?.descripcion || 'Sin descripción'}</p>
                                    <div className="precio-unitario">
                                        {formatPrice((item.producto?.precio || 0))} por unidad
                                    </div>
                                </div>
                                <div className="producto-controles">
                                    <div className="cantidad-controles">
                                        <button 
                                            onClick={() => handleEditarCantidad(item.id_detalle, item.cantidad - 1, item.cantidad)}
                                            className="btn-cantidad"
                                            disabled={item.cantidad <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="cantidad-display">{item.cantidad}</span>
                                        <button 
                                            onClick={() => handleEditarCantidad(item.id_detalle, item.cantidad + 1, item.cantidad)}
                                            className="btn-cantidad"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => handleEliminarProducto(item.id_detalle)}
                                        className="btn-eliminar"
                                        title="Eliminar producto"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="producto-total">
                                    {formatPrice((item.producto?.precio || 0) * item.cantidad)}
                                </div>
                            </div>
                        ))}
                    </div>
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

                <div className="info-envio">
                    <div className="info-card">
                        <h3>🚚 Información de Envío</h3>
                        <p>Tiempo estimado: 2-3 días hábiles</p>
                        <p>Envío gratuito para compras mayores a S/ 100.00</p>
                    </div>
                </div>

                <div className="acciones">
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn-secondary"
                    >
                        Seguir Comprando
                    </button>
                    <button 
                        onClick={handleContinuar} 
                        className="btn-primary"
                        disabled={detalles.length === 0}
                    >
                        Continuar con la Compra
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetalleVenta;