import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MiniCarrito.css';

const MiniCarrito = ({ 
    isVisible, 
    onClose, 
    carrito, 
    detalles, 
    total, 
    handleDisminuirCantidad, 
    handleAumentarCantidad, 
    eliminarDetalle,
}) => {
    const navigate = useNavigate();

    if (!isVisible) {
        return null;
    }

    const handleFinalizarCompra = async () => {
        try {
            // Cerrar el mini carrito
            onClose();
            
            // Si no hay carrito activo, crear uno nuevo
            if (!carrito) {
                // Crear una nueva venta/carrito
                const idUsuario = localStorage.getItem('idUsuario');
                const response = await fetch('http://localhost:8081/api/carrito/crear', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idUsuario: parseInt(idUsuario) })
                });
                
                if (response.ok) {
                    const nuevoCarrito = await response.json();
                    // Navegar al detalle con el ID del carrito/venta
                    navigate(`/detalle-venta/${nuevoCarrito.idVenta}`);
                } else {
                    // Si falla la creación, navegar sin ID (nueva venta desde carrito)
                    navigate('/detalle-venta/nuevo');
                }
            } else {
                // Navegar con el ID de la venta existente
                navigate(`/detalle-venta/${carrito.idVenta}`);
            }
        } catch (error) {
            console.error('Error al finalizar compra:', error);
            // En caso de error, navegar sin ID
            navigate('/detalle-venta/nuevo');
        }
    };

    return (
        <div className="mini-carrito-overlay" onClick={onClose}>
            <div className="mini-carrito-container" onClick={(e) => e.stopPropagation()}>
                <div className="mini-carrito-header">
                    <h3>Tu Carrito</h3>
                    <button className="mini-carrito-close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="mini-carrito-body">
                    {detalles.length === 0 ? (
                        <p>El carrito está vacío.</p>
                    ) : (
                        <ul className="mini-carrito-items">
                            {detalles.map((item) => (
                                <li key={item.id_detalle} className="mini-carrito-item">
                                    <div className="item-info">
                                        <span>{item.producto ? item.producto.nombre : 'Producto'}</span>
                                        <span className="item-price">
                                            S/{item.producto && item.producto.precio 
                                                ? parseFloat(item.producto.precio).toFixed(2) 
                                                : '0.00'}
                                        </span>
                                    </div>
                                    
                                    <div className="item-quantity-controls">
                                        <button 
                                            onClick={() => handleDisminuirCantidad(item.id_detalle, item.cantidad)}
                                            disabled={item.cantidad <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.cantidad}</span>
                                        <button 
                                            onClick={() => handleAumentarCantidad(item.id_detalle, item.cantidad)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <button 
                                        className="item-remove-btn" 
                                        onClick={() => eliminarDetalle(item.id_detalle)}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div className="mini-carrito-footer">
                    <div className="mini-carrito-total">
                        <strong>Total:</strong>
                        <span>S/{total ? total.toFixed(2) : '0.00'}</span>
                    </div>
                    
                    {detalles.length > 0 && (
                        <button 
                            className="mini-carrito-finalizar-btn"
                            onClick={handleFinalizarCompra}
                        >
                            Finalizar Compra
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiniCarrito;