
import React, { useState, useEffect } from 'react';
import '../css/Dashboard.css';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = () => {
  // Estados para los datos
  const [metricas, setMetricas] = useState({
    ingresosTotales: 0,
    cambioIngresos: 0,
    pedidosCompletados: 0,
    nuevosClientes: 0,
    productosVendidos: 0
  });
  
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [quantityData, setQuantityData] = useState([]); // NUEVO
  const [quantityByCategoryData, setQuantityByCategoryData] = useState([]); // NUEVO
  const [categoryTableData, setCategoryTableData] = useState([]); // NUEVO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const COLORS2 = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]; // Colores para el segundo gráfico circular
  const BACKEND_URL = 'http://localhost:8081';

  // Función para obtener las métricas
  const fetchMetricas = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/metricas`);
      if (!response.ok) throw new Error('Error al obtener métricas');
      const data = await response.json();
      setMetricas(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  // Función para obtener ventas por mes
  const fetchVentasPorMes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/ventas-por-mes`);
      if (!response.ok) throw new Error('Error al obtener ventas por mes');
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        name: item.mes,
        ventas: parseFloat(item.ventas)
      }));
      
      setSalesData(formattedData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Función para obtener ventas por categoría
  const fetchVentasPorCategoria = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/ventas-por-categoria`);
      if (!response.ok) throw new Error('Error al obtener ventas por categoría');
      const data = await response.json();
      
      const formattedData = data
        .filter(item => parseFloat(item.value) > 0)
        .map(item => ({
          name: item.name,
          value: parseFloat(item.value)
        }));
      
      setCategoryData(formattedData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // NUEVA: Función para obtener cantidad por mes
  const fetchCantidadPorMes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/cantidad-por-mes`);
      if (!response.ok) throw new Error('Error al obtener cantidad por mes');
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        name: item.mes,
        cantidad: parseInt(item.cantidad)
      }));
      
      setQuantityData(formattedData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // NUEVA: Función para obtener cantidad por categoría
  const fetchCantidadPorCategoria = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/cantidad-por-categoria`);
      if (!response.ok) throw new Error('Error al obtener cantidad por categoría');
      const data = await response.json();
      
      const formattedData = data
        .filter(item => parseInt(item.value) > 0)
        .map(item => ({
          name: item.name,
          value: parseInt(item.value)
        }));
      
      setQuantityByCategoryData(formattedData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // NUEVA: Función para obtener resumen de categorías
  const fetchResumenCategorias = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/resumen-categorias`);
      if (!response.ok) throw new Error('Error al obtener resumen de categorías');
      const data = await response.json();
      setCategoryTableData(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMetricas(),
        fetchVentasPorMes(),
        fetchVentasPorCategoria(),
        fetchCantidadPorMes(),
        fetchCantidadPorCategoria(),
        fetchResumenCategorias()
      ]);
      setLoading(false);
    };

    loadDashboardData();
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(loadDashboardData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para formatear números
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value || 0);
  };

  // Función para formatear porcentajes
  const formatPercentage = (value) => {
    const absValue = Math.abs(value || 0);
    return `${absValue.toFixed(1)}%`;
  };

  // Función para obtener la fecha actual formateada
  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('es-PE', options);
  };


  // Funciones para exportar reportes
const exportarExcel = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/dashboard/export/categorias/excel`);
    if (!response.ok) throw new Error('Error al exportar a Excel');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `resumen_categorias_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    alert('Error al exportar el archivo Excel');
  }
};

const exportarPdf = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/dashboard/export/categorias/pdf`);
    if (!response.ok) throw new Error('Error al exportar a PDF');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `resumen_categorias_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    alert('Error al exportar el archivo PDF');
  }
};



  if (loading) {
    return (
      <div className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner">⏳</div>
            <p>Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-main">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          <p>Error al cargar el dashboard: {error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Resumen del Negocio</h1>
          <p>Resumen completo del rendimiento de tu negocio</p>
          <div className="date-display">
            <span className="date-icon">📅</span>
            <span>{getCurrentDate()}</span>
          </div>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <input type="text" placeholder="Buscar en dashboard..." className="search-input" />
            <button className="search-button">🔍</button>
          </div>
          <button className="notification-button">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Métricas Principales */}
        <section className="dashboard-section">
          <h2 className="section-title">📊 Métricas Principales</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon revenue-icon">💰</div>
              <div className="metric-details">
                <h3>Ingresos Totales</h3>
                <div className="metric-value">{formatCurrency(metricas.ingresosTotales)}</div>
                <div className={`metric-change ${metricas.cambioIngresos >= 0 ? 'positive' : 'negative'}`}>
                  <span>{metricas.cambioIngresos >= 0 ? '↗️' : '↘️'} {formatPercentage(metricas.cambioIngresos)}</span>
                  <span className="change-period">vs. mes anterior</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon orders-icon">🛒</div>
              <div className="metric-details">
                <h3>Pedidos Completados</h3>
                <div className="metric-value">{metricas.pedidosCompletados}</div>
                <div className="metric-change positive">
                  <span>📈 Este mes</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon customers-icon">👥</div>
              <div className="metric-details">
                <h3>Nuevos Clientes</h3>
                <div className="metric-value">{metricas.nuevosClientes}</div>
                <div className="metric-change positive">
                  <span>✨ Este mes</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon products-icon">📦</div>
              <div className="metric-details">
                <h3>Productos Vendidos</h3>
                <div className="metric-value">{metricas.productosVendidos}</div>
                <div className="metric-change positive">
                  <span>📊 Este mes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gráficos de Ventas */}
        <section className="dashboard-section">
          <h2 className="section-title">📈 Análisis de Ventas</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Tendencia de Ventas (S/)</h3>
                <select className="chart-select">
                  <option>Últimos 7 meses</option>
                  <option>Últimos 12 meses</option>
                  <option>Este año</option>
                </select>
              </div>
              <div className="chart-body">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        labelStyle={{ color: '#666' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ventas"
                        stroke="#0694a2"
                        strokeWidth={3}
                        dot={{ fill: "#0694a2", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    No hay datos de ventas disponibles
                  </p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Ventas por Categoría (S/)</h3>
                <select className="chart-select">
                  <option>Este mes</option>
                  <option>Último trimestre</option>
                  <option>Este año</option>
                </select>
              </div>
              <div className="chart-body">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    No hay datos de categorías disponibles
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* NUEVA SECCIÓN: Análisis de Cantidades */}
        <section className="dashboard-section">
          <h2 className="section-title">📦 Análisis de Cantidades</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Productos Vendidos por Mes</h3>
                <select className="chart-select">
                  <option>Últimos 7 meses</option>
                  <option>Últimos 12 meses</option>
                  <option>Este año</option>
                </select>
              </div>
              <div className="chart-body">
                {quantityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={quantityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        formatter={(value) => [`${value} unidades`, 'Cantidad']}
                        labelStyle={{ color: '#666' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cantidad"
                        stroke="#FF6B6B"
                        strokeWidth={3}
                        dot={{ fill: "#FF6B6B", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    No hay datos de cantidades disponibles
                  </p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Cantidad por Categoría</h3>
                <select className="chart-select">
                  <option>Este mes</option>
                  <option>Último trimestre</option>
                  <option>Este año</option>
                </select>
              </div>
              <div className="chart-body">
                {quantityByCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={quantityByCategoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {quantityByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} unidades`, 'Cantidad']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    No hay datos de cantidades por categoría disponibles
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* NUEVA SECCIÓN: Tabla Resumen por Categoría */}
        <section className="dashboard-section">
          <h2 className="section-title">📋 Resumen por Categoría</h2>
          <div className="table-container">
            <div className="table-header">
              <h3>Métricas detalladas por categoría</h3>
             <div className="export-buttons">
            <button className="export-btn" onClick={exportarExcel}>
              📊 Excel
            </button>
            <button className="export-btn" onClick={exportarPdf}>
              📄 PDF
            </button>
          </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Productos</th>
                    <th>Cantidad Vendida</th>
                    <th>Ingresos Totales</th>
                    <th>Precio Promedio</th>
                    <th>N° Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryTableData.length > 0 ? (
                    categoryTableData.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <div className="category-cell">
                            <span className="category-badge">{row.categoria}</span>
                          </div>
                        </td>
                        <td>{row.productos_totales}</td>
                        <td>
                          <strong>{row.cantidad_vendida}</strong>
                        </td>
                        <td className="amount">
                          {formatCurrency(row.ingresos_totales)}
                        </td>
                        <td>
                          {formatCurrency(row.precio_promedio)}
                        </td>
                        <td>
                          <span className="status-badge completado">
                            {row.numero_ventas} ventas
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        No hay datos de categorías disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;