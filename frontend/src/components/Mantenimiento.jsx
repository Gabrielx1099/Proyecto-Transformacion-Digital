import React, { useState } from 'react';
import axios from 'axios';
import '../css/Mantenimiento.css';

const MantenimientoPanel = () => {
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState('info');

  const mostrarMensaje = (respuesta, tipo = 'info') => {
    setTipoMensaje(tipo);

    if (typeof respuesta === 'string') {
      setMensaje(respuesta);
    } else if (respuesta && typeof respuesta === 'object') {
      let mensajeFormateado = '';

      if (respuesta.success !== undefined && respuesta.message) {
        mensajeFormateado += `${respuesta.success ? '✅' : '❌'} ${respuesta.message}`;
      }

      if (respuesta.timestamp) {
        mensajeFormateado += `\n📅 ${respuesta.timestamp}`;
      }

      if (respuesta.archivo) {
        mensajeFormateado += `\n📁 Archivo: ${respuesta.archivo}`;
      }

      if (respuesta.tipo) {
        mensajeFormateado += `\n📋 Tipo: ${respuesta.tipo}`;
      }

      if (respuesta.productosAfectados !== undefined) {
        mensajeFormateado += `\n🔢 Productos afectados: ${respuesta.productosAfectados}`;
      }

      if (respuesta.archivosEliminados !== undefined) {
        mensajeFormateado += `\n🗑️ Archivos eliminados: ${respuesta.archivosEliminados}`;
      }

      if (respuesta.archivosLimpiados !== undefined) {
        mensajeFormateado += `\n🧽 Archivos limpiados: ${respuesta.archivosLimpiados}`;
      }

      // Estadísticas detalladas
      if (respuesta.totalProductos !== undefined) {
        mensajeFormateado += `\n📦 Total productos: ${respuesta.totalProductos}`;
      }

      if (respuesta.productosStockCero !== undefined) {
        mensajeFormateado += `\n🚫 Productos sin stock: ${respuesta.productosStockCero}`;
      }

      if (respuesta.productosInactivos !== undefined) {
        mensajeFormateado += `\n⛔ Productos inactivos: ${respuesta.productosInactivos}`;
      }

      if (respuesta.totalLogs !== undefined) {
        mensajeFormateado += `\n📄 Logs existentes: ${respuesta.totalLogs}`;
      }

      if (respuesta.totalBackups !== undefined) {
        mensajeFormateado += `\n💾 Total de backups: ${respuesta.totalBackups}`;
      }

      setMensaje(mensajeFormateado);
    }
  };

  const ejecutar = async (endpoint, textoError) => {
    setCargando(true);
    setMensaje('');
    try {
      const res = await axios.post(`http://localhost:8081/api/${endpoint}`);
      mostrarMensaje(res.data, res.data.success ? 'success' : 'error');
    } catch (err) {
      console.error(textoError, err);
      mostrarMensaje(`❌ ${textoError}: ` + (err.response?.data?.message || err.message), 'error');
    } finally {
      setCargando(false);
    }
  };

  const ejecutarBackup = () => ejecutar('mantenimiento/backup', 'Error en backup');
  const ejecutarBackupPersonalizado = (incluirDatos) => ejecutar(`mantenimiento/backup/personalizado?incluirDatos=${incluirDatos}`, 'Error en backup personalizado');
  const marcarProductosInactivos = () => ejecutar('mantenimiento/limpieza/productos/marcar-inactivos', 'Error al marcar productos como inactivos');
  const limpiarLogs = () => ejecutar('mantenimiento/limpieza/logs', 'Error al limpiar logs antiguos');
  const limpiarBackupsAntiguos = () => ejecutar('mantenimiento/limpieza/backups', 'Error al limpiar backups antiguos');
  const ejecutarLimpiezaCompleta = () => ejecutar('mantenimiento/limpieza/completa', 'Error en limpieza completa');

  const obtenerEstadisticas = async () => {
    setCargando(true);
    setMensaje('');
    try {
      const res = await axios.get('http://localhost:8081/api/mantenimiento/limpieza/estadisticas');
      mostrarMensaje(res.data, res.data.success ? 'success' : 'error');
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      mostrarMensaje('❌ Error al obtener estadísticas: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setCargando(false);
    }
  };

  const verificarEstadoServicios = async () => {
    setCargando(true);
    setMensaje('');
    try {
      const [backupStatus, limpiezaStatus] = await Promise.all([
        axios.get('http://localhost:8081/api/mantenimiento/backup/status'),
        axios.get('http://localhost:8081/api/mantenimiento/limpieza/status')
      ]);

      const mensaje = `🔄 Estado de Servicios:\n\n` +
        `📦 Backup: ${backupStatus.data.status} (${backupStatus.data.message})\n` +
        `🧹 Limpieza: ${limpiezaStatus.data.status} (${limpiezaStatus.data.mensaje})\n\n` +
        `📅 Verificado: ${new Date().toLocaleString()}`;

      mostrarMensaje(mensaje, 'success');
    } catch (err) {
      console.error('Error al verificar estado:', err);
      mostrarMensaje('❌ Error al verificar estado de servicios: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mantenimiento-container">
      <h2 className="mantenimiento-title">🛠 Panel de Mantenimiento</h2>

      <div className="mantenimiento-section">
        <h3>📦 Gestión de Backups</h3>
        <div className="mantenimiento-buttons">
          <button onClick={ejecutarBackup} disabled={cargando} className="mantenimiento-button backup-button">
            📦 Generar Backup Completo
          </button>
          <button onClick={() => ejecutarBackupPersonalizado(false)} disabled={cargando} className="mantenimiento-button backup-button">
            📋 Backup Solo Estructura
          </button>
          <button onClick={() => ejecutarBackupPersonalizado(true)} disabled={cargando} className="mantenimiento-button backup-button">
            📦 Backup Completo con Datos
          </button>
        </div>
      </div>

      <div className="mantenimiento-section">
        <h3>🧹 Limpieza del Sistema</h3>
        <div className="mantenimiento-buttons">
          <button onClick={marcarProductosInactivos} disabled={cargando} className="mantenimiento-button limpieza-button">
            🔄 Marcar Productos Sin Stock como Inactivos
          </button>
          <button onClick={limpiarLogs} disabled={cargando} className="mantenimiento-button limpieza-button">
            🧽 Limpiar Logs Antiguos
          </button>
          <button onClick={limpiarBackupsAntiguos} disabled={cargando} className="mantenimiento-button limpieza-button">
            🗂️ Limpiar Backups Antiguos
          </button>
          <button onClick={ejecutarLimpiezaCompleta} disabled={cargando} className="mantenimiento-button limpieza-button warning">
            🧹 Limpieza Completa del Sistema
          </button>
        </div>
      </div>

      <div className="mantenimiento-section">
        <h3>📊 Información y Estado</h3>
        <div className="mantenimiento-buttons">
          <button onClick={obtenerEstadisticas} disabled={cargando} className="mantenimiento-button info-button">
            📊 Obtener Estadísticas
          </button>
          <button onClick={verificarEstadoServicios} disabled={cargando} className="mantenimiento-button info-button">
            ⚡ Verificar Estado de Servicios
          </button>
        </div>
      </div>

      {cargando && (
        <div className="mantenimiento-loading">
          <div className="spinner"></div>
          <p>Procesando operación...</p>
        </div>
      )}

      {mensaje && (
        <div className={`mantenimiento-alert ${tipoMensaje}`}>
          <pre>{mensaje}</pre>
        </div>
      )}
    </div>
  );
};

export default MantenimientoPanel;
