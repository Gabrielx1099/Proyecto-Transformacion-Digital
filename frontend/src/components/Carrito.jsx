import React, { useEffect, useState } from 'react';
import '../css/Carrito.css';

const BACKEND_PORT = 8081;

const Carrito = () => {
  const [carrito, setCarrito] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [total, setTotal] = useState(0);
  const idUsuario = localStorage.getItem('id');

  useEffect(() => {
    if (idUsuario) {
      fetchCarrito();
    }
  }, [idUsuario]);

  const fetchCarrito = async () => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/${idUsuario}`);
      if (res.ok) {
        const venta = await res.json();
        setCarrito(venta);
        if (venta) {
          fetchDetalles(venta.idVenta);
        } else {
          setDetalles([]);
          setTotal(0);
        }
      } else {
        setMensaje('No hay carrito activo.');
        setCarrito(null);
        setDetalles([]);
        setTotal(0);
      }
    } catch (error) {
      setMensaje('Error al obtener el carrito.');
    }
  };

  const fetchDetalles = async (idVenta) => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/detalles/${idVenta}`);
      if (res.ok) {
        const data = await res.json();
        setDetalles(data);
        calcularTotal(data);
      }
    } catch (error) {
      setMensaje('Error al obtener los detalles del carrito.');
    }
  };

  const calcularTotal = (detalles) => {
    let suma = 0;
    detalles.forEach(item => {
      if (item.producto && item.producto.precio) {
        suma += item.producto.precio * item.cantidad;
      }
    });
    setTotal(suma);
  };

  const eliminarDetalle = async (idDetalle) => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/detalle/${idDetalle}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCarrito();
      }
    } catch (error) {
      setMensaje('Error al eliminar el producto del carrito.');
    }
  };

  const finalizarCompra = async () => {
    if (!carrito) return;
    try {
      const ventaFinal = { ...carrito, total };
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/${idUsuario}/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaFinal)
      });
      if (res.ok) {
        setMensaje('¡Compra realizada con éxito!');
        setCarrito(null);
        setDetalles([]);
        setTotal(0);
      } else {
        setMensaje('Error al finalizar la compra.');
      }
    } catch (error) {
      setMensaje('Error al finalizar la compra.');
    }
  };

  const handleDisminuirCantidad = async (idDetalle, cantidad) => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/detalle/${idDetalle}/disminuir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: cantidad - 1 })
      });
      if (res.ok) {
        fetchCarrito();
      }
    } catch (error) {
      setMensaje('Error al disminuir la cantidad del producto.');
    }
  };

  const handleAumentarCantidad = async (idDetalle, cantidad) => {
    try {
      const res = await fetch(`http://localhost:${BACKEND_PORT}/api/carrito/detalle/${idDetalle}/aumentar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: cantidad + 1 })
      });
      if (res.ok) {
        fetchCarrito();
      }
    } catch (error) {
      setMensaje('Error al aumentar la cantidad del producto.');
    }
  };

  if (!idUsuario) {
    return <div>Debes iniciar sesión para ver tu carrito.</div>;
  }

  return (
    <div className="carrito-container">
      <h2>Carrito de Compras</h2>
      {mensaje && mensaje !== "No hay carrito activo." && mensaje !== "El carrito está vacío." && (
        <p>{mensaje}</p>
      )}
      {detalles.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((item) => (
              <tr key={item.id_detalle}>
                <td>{item.producto ? item.producto.nombre : item.idProducto}</td>
                <td>
                  <button onClick={() => handleDisminuirCantidad(item.id_detalle, item.cantidad)}>-</button>
                  {item.cantidad}
                  <button onClick={() => handleAumentarCantidad(item.id_detalle, item.cantidad)}>+</button>
                </td>
                <td>{item.producto ? `S/${item.producto.precio}` : ''}</td>
                <td>
                  <button onClick={() => eliminarDetalle(item.id_detalle)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Total: S/{total.toFixed(2)}</h3>
      {detalles.length > 0 && (
        <button onClick={finalizarCompra}>Finalizar Compra</button>
      )}
    </div>
  );
};

export default Carrito; 