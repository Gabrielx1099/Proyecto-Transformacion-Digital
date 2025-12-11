import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import '../css/IntranetLayout.css';

function IntranetLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Cerrar sesión desde Intranet');
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  return (
    <div className="intranet-layout">
      <div className="sidebar">
        <div>
          <h3>Intranet Menu</h3>
          <ul>
            <li><Link to="/intranet/dashboard">Dashboard</Link></li>
            <li><Link to="/intranet/proveedores">Proveedores</Link></li>
            <li><Link to="/intranet/productos">Productos</Link></li>
            <li><Link to="/intranet/subcategoria">Subcategorias</Link></li>
            <li><Link to="/intranet/marca">Marcas</Link></li>
            <li><Link to="/intranet/registro">Registro Admin</Link></li>
            <li><Link to="/intranet/mantenimiento">Mantenimiento</Link></li>

          </ul>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default IntranetLayout; 