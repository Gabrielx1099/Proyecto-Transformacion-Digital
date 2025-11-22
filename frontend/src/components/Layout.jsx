import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Layout.css';
import MiniCarrito from './MiniCarrito';
import { useCarrito } from '../context/CarritoContext'; // Importar useCarrito del contexto

const BACKEND_PORT = 8081; // Asegúrate de que este puerto sea correcto

const Layout = ({ children }) => {
  const [nombre, setNombre] = useState(localStorage.getItem('nombre'));
  const [rol, setRol] = useState(localStorage.getItem('rol'));
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Eliminar estados locales de carrito, detalles, total, showMiniCarrito
  // const [showMiniCarrito, setShowMiniCarrito] = useState(false);
  // const [carrito, setCarrito] = useState(null);
  // const [detalles, setDetalles] = useState([]);
  // const [total, setTotal] = useState(0);

  // Obtener estados y funciones del carrito desde el contexto
  const { 
    carrito,
    detalles,
    total,
    showMiniCarrito,
    setShowMiniCarrito,
    fetchCarrito,
    toggleMiniCarrito, // También se puede obtener del contexto si se define allí
    handleAumentarCantidad, // Estas funciones de manejo de cantidad/eliminación deberían estar en el contexto o pasarse desde App/index
    handleDisminuirCantidad,
    eliminarDetalle,
    finalizarCompra,
    limpiarCarrito
  } = useCarrito();


  const isLoggedIn = !!rol;
  const idUsuario = localStorage.getItem('idUsuario');
  const navigate = useNavigate();

  // Efecto para actualizar nombre y rol al cambiar localStorage
  useEffect(() => {
    const onStorage = () => {
      setNombre(localStorage.getItem('nombre'));
      setRol(localStorage.getItem('rol'));
      // También actualizamos idUsuario aquí si es necesario
      // setIdUsuario(localStorage.getItem('idUsuario'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Efecto para cargar el carrito activo al iniciar o cuando el usuario cambia
  useEffect(() => {
    console.log('useEffect en Layout.jsx ejecutado. isLoggedIn:', isLoggedIn, 'idUsuario:', idUsuario);
    // Asegurarse de que el usuario esté logueado y tengamos el ID antes de intentar cargar el carrito
    if (isLoggedIn && idUsuario) {
      console.log('Llamando a fetchCarrito desde useEffect en Layout.jsx');
      fetchCarrito(parseInt(idUsuario));
    }
  }, [isLoggedIn, idUsuario]); // Dependencias: solo se ejecuta cuando isLoggedIn o idUsuario cambian

  // Eliminar la función fetchCarrito local
  // const fetchCarrito = async (userId) => { ... };

  const handleLogout = () => {
    localStorage.clear();
    limpiarCarrito();
    window.dispatchEvent(new Event('storage'));
    // Si tienes acceso al contexto aquí, también puedes limpiar el carrito:
    // limpiarCarrito();
    navigate('/');
  };

  // La lógica de toggleMiniCarrito podría estar en el contexto, pero la mantenemos aquí por ahora si maneja la navegación
  const toggleMiniCarritoLocal = () => {
     if (!isLoggedIn) {
       navigate('/login');
     } else {
       // Llamar a toggleMiniCarrito del contexto
       toggleMiniCarrito();
     }
  };

  // Si toggleMiniCarrito ya está en el contexto y maneja la navegación, puedes usarlo directamente:
  // const toggleMiniCarritoConContext = useCarrito().toggleMiniCarrito; // O similar

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Las funciones handleAumentarCantidad, handleDisminuirCantidad, eliminarDetalle, finalizarCompra
  // deberían pasarse al contexto para centralizar la lógica si aún no lo están.
  // Por ahora, asumimos que si no se obtienen del contexto, se manejan aquí o se obtendrán del contexto después.


  return (
    <div className="layout">
      <nav className="navbar-custom">
        <div className="nav-left">
          <Link to="/" className="brand">
            <span role="img" aria-label="logo"></span> Urban <span className="brand-highlight">Claudia</span>
          </Link>

          <button className="hamburger" onClick={toggleMenu}>
            {menuAbierto ? '✖️' : '☰'}
          </button>
        </div>

        <div className={`nav-links-custom ${menuAbierto ? 'show' : ''}`}>
          <Link to="/" onClick={() => setMenuAbierto(false)}>Inicio</Link>
          <Link to="/zapatillas" onClick={() => setMenuAbierto(false)}>Zapatillas</Link>
          <Link to="/zapatos" onClick={() => setMenuAbierto(false)}>Zapatos</Link>
          
          {!isLoggedIn && (
            <>
              <Link to="/login" className="icon-link" onClick={() => setMenuAbierto(false)}>
                <span role="img" aria-label="login">🔑</span> Iniciar sesión
              </Link>
              <Link to="/registrar" className="icon-link" onClick={() => setMenuAbierto(false)}>
                <span role="img" aria-label="register">👤</span> Registrarse
              </Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <span className="icon-link user-name">
                <span role="img" aria-label="user">👤</span> {nombre || 'Usuario'}
              </span>
              <button className="icon-link" onClick={() => { handleLogout(); setMenuAbierto(false); }}>
                <span role="img" aria-label="logout">🚪</span> Cerrar sesión
              </button>
            </>
          )}
        </div>

        <div className="nav-right">
          <span className="icon-link"><span role="img" aria-label="search">🔍</span></span>
          {/* El enlace al carrito /carrito ahora se gestiona con el botón flotante */}
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      {/* Botón flotante del carrito */}
      {isLoggedIn && (
      <button className="floating-cart-button" onClick={toggleMiniCarritoLocal}> {/* Usar la función local o del contexto */}
         <span role="img" aria-label="cart">🛒</span>
          {detalles.length > 0 && <span className="cart-item-count">{detalles.length}</span>}
      </button>
      )}

      {/* Mini Carrito Component */}
      <MiniCarrito
        isVisible={showMiniCarrito} // showMiniCarrito del contexto
        onClose={() => setShowMiniCarrito(false)} // setShowMiniCarrito del contexto
        carrito={carrito} // carrito del contexto
        detalles={detalles} // detalles del contexto
        total={total} // total del contexto
        handleAumentarCantidad={handleAumentarCantidad} // Deberían venir del contexto
        handleDisminuirCantidad={handleDisminuirCantidad} // Deberían venir del contexto
        eliminarDetalle={eliminarDetalle} // Deberían venir del contexto
        finalizarCompra={finalizarCompra} // Deberían venir del contexto
      />

      <footer className="footer-custom">
        <div className="footer-col">
          <div className="footer-brand">
            <span className="brand-highlight">Urban Claudia</span>
          </div>
          <p>
            Calzados de todo tipo para ti, al mejor precio y con la mejor calidad.
          </p>
          <div className="footer-social">
            <a href="https://www.facebook.com" className="facebook" target="_blank" rel="noopener noreferrer"></a>
            <a href="https://www.instagram.com/panalera_claudia/reels/" className="instagram" target="_blank" rel="noopener noreferrer"></a>
            <a href="https://wa.me/51935532263" className="whatsapp" target="_blank" rel="noopener noreferrer"></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Enlaces rápidos</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/zapatillas">Zapatillas</Link></li>
            <li><Link to="/zapatos">Zapatos</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Información</h4>
          <ul>
            <li><a href="#">Términos y condiciones</a></li>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Política de envíos</a></li>
            <li><a href="#">Devoluciones</a></li>
            <li><a href="#">Preguntas frecuentes</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li>Mza.C-10-Int 65-Lote 3Urb. Las Banderas-Prov.Const.del Callo</li>
            <li>+51 935 532 264</li>
            <li><a href="mailto:contacto@panaleriaclaudia.com">contacto@urbanclaudia.com</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
