package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.limpieza;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class LimpiezaService {

    private static final Logger logger = LoggerFactory.getLogger(LimpiezaService.class);
    private final JdbcTemplate jdbcTemplate;

    @Value("${limpieza.logs.directory}")
    private String directorioLogs;

    @Value("${limpieza.logs.dias.antiguedad:7}")
    private int diasAntiguedadLogs;

    @Value("${limpieza.productos.eliminar.stock.cero:false}")
    private boolean permitirEliminarStockCero;

    @Value("${limpieza.backup.directory}")
    private String directorioBackup;

    @Value("${limpieza.backup.dias.antiguedad:7}")
    private int diasAntiguedadBackup;

    public LimpiezaService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Map<String, Object> marcarProductosSinStockComoInactivos() {
        Map<String, Object> resultado = new HashMap<>();
        try {
            verificarYAgregarColumnaActivo();

            String sqlConteo = "SELECT COUNT(*) FROM productos WHERE stock = 0 AND (activo IS NULL OR activo = 1)";
            Integer productosAfectados = jdbcTemplate.queryForObject(sqlConteo, Integer.class);

            if (productosAfectados == null || productosAfectados == 0) {
                resultado.put("productosAfectados", 0);
                resultado.put("mensaje", "No hay productos con stock 0 para marcar como inactivos");
                resultado.put("success", true);
                return resultado;
            }

            String sqlUpdate = "UPDATE productos SET activo = 0 WHERE stock = 0 AND (activo IS NULL OR activo = 1)";
            int filasAfectadas = jdbcTemplate.update(sqlUpdate);

            resultado.put("productosAfectados", filasAfectadas);
            resultado.put("mensaje", "Productos marcados como inactivos correctamente");
            resultado.put("success", true);
            resultado.put("timestamp", fechaActual());

        } catch (DataAccessException e) {
            resultado.put("success", false);
            resultado.put("mensaje", "Error al marcar productos como inactivos: " + e.getMessage());
        }
        return resultado;
    }

    @Transactional
    public Map<String, Object> eliminarProductosSinStock() {
        Map<String, Object> resultado = new HashMap<>();

        if (!permitirEliminarStockCero) {
            resultado.put("success", false);
            resultado.put("mensaje", "No permitido por configuración");
            return resultado;
        }

        try {
            String sqlSelect = "SELECT id_producto, nombre FROM productos WHERE stock = 0";
            List<Map<String, Object>> productos = jdbcTemplate.queryForList(sqlSelect);

            if (productos.isEmpty()) {
                resultado.put("productosEliminados", 0);
                resultado.put("mensaje", "No hay productos con stock 0 para eliminar");
                resultado.put("success", true);
                return resultado;
            }

            String sqlDelete = "DELETE FROM productos WHERE stock = 0";
            int eliminados = jdbcTemplate.update(sqlDelete);

            resultado.put("productosEliminados", eliminados);
            resultado.put("mensaje", "Productos con stock 0 eliminados correctamente");
            resultado.put("success", true);
            resultado.put("timestamp", fechaActual());

        } catch (DataAccessException e) {
            resultado.put("success", false);
            resultado.put("mensaje", "Error: " + e.getMessage());
        }

        return resultado;
    }

    public Map<String, Object> limpiarLogsAntiguos() {
        Map<String, Object> resultado = new HashMap<>();
        List<String> eliminados = new ArrayList<>();

        try {
            File carpeta = new File(directorioLogs);
            if (!carpeta.exists()) {
                resultado.put("success", false);
                resultado.put("mensaje", "Directorio no encontrado");
                return resultado;
            }

            File[] archivos = carpeta.listFiles((dir, name) -> name.toLowerCase().endsWith(".log"));

            if (archivos == null || archivos.length == 0) {
                resultado.put("success", true);
                resultado.put("mensaje", "No hay archivos .log");
                resultado.put("archivosEliminados", 0);
                return resultado;
            }

            int count = 0;
            for (File archivo : archivos) {
                long dias = ChronoUnit.DAYS.between(
                        Instant.ofEpochMilli(archivo.lastModified()), Instant.now()
                );

                if (dias > diasAntiguedadLogs) {
                    if (archivo.delete()) {
                        eliminados.add(archivo.getName());
                        count++;
                    }
                }
            }

            resultado.put("success", true);
            resultado.put("mensaje", "Limpieza de logs completada");
            resultado.put("archivosEliminados", count);
            resultado.put("listaArchivosEliminados", eliminados);
            resultado.put("timestamp", fechaActual());

        } catch (Exception e) {
            resultado.put("success", false);
            resultado.put("mensaje", "Error durante limpieza logs: " + e.getMessage());
        }

        return resultado;
    }

    public Map<String, Object> limpiarBackupsAntiguos() {
        Map<String, Object> resultado = new HashMap<>();
        List<String> eliminados = new ArrayList<>();

        try {
            File carpeta = new File(directorioBackup);
            if (!carpeta.exists()) {
                resultado.put("success", false);
                resultado.put("mensaje", "Directorio de backup no encontrado");
                return resultado;
            }

            File[] archivos = carpeta.listFiles((dir, name) -> name.toLowerCase().endsWith(".sql"));

            if (archivos == null || archivos.length == 0) {
                resultado.put("success", true);
                resultado.put("mensaje", "No hay backups .sql");
                resultado.put("archivosEliminados", 0);
                return resultado;
            }

            int count = 0;
            for (File archivo : archivos) {
                long dias = ChronoUnit.DAYS.between(
                        Instant.ofEpochMilli(archivo.lastModified()), Instant.now()
                );

                if (dias > diasAntiguedadBackup) {
                    if (archivo.delete()) {
                        eliminados.add(archivo.getName());
                        count++;
                    }
                }
            }

            resultado.put("success", true);
            resultado.put("mensaje", "Limpieza de backups completada");
            resultado.put("archivosEliminados", count);
            resultado.put("listaArchivosEliminados", eliminados);
            resultado.put("timestamp", fechaActual());

        } catch (Exception e) {
            resultado.put("success", false);
            resultado.put("mensaje", "Error durante limpieza backups: " + e.getMessage());
        }

        return resultado;
    }

    @Transactional
    public Map<String, Object> ejecutarLimpiezaCompleta() {
        Map<String, Object> resultado = new HashMap<>();

        try {
            Map<String, Object> productos = marcarProductosSinStockComoInactivos();
            Map<String, Object> logs = limpiarLogsAntiguos();
            Map<String, Object> backups = limpiarBackupsAntiguos();

            resultado.put("success", true);
            resultado.put("mensaje", "Limpieza completa ejecutada");
            resultado.put("productos", productos);
            resultado.put("logs", logs);
            resultado.put("backups", backups);
            resultado.put("timestamp", fechaActual());

        } catch (Exception e) {
            resultado.put("success", false);
            resultado.put("mensaje", "Error al ejecutar limpieza completa: " + e.getMessage());
        }

        return resultado;
    }

    public Map<String, Object> obtenerEstadisticasLimpieza() {
        Map<String, Object> stats = new HashMap<>();

        try {
            stats.put("totalProductos", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos", Integer.class));
            stats.put("productosStockCero", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE stock = 0", Integer.class));
            stats.put("productosInactivos", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE activo = 0", Integer.class));

            File logs = new File(directorioLogs);
            stats.put("totalLogs", logs.exists() ? logs.listFiles().length : 0);

            File backups = new File(directorioBackup);
            stats.put("totalBackups", backups.exists() ? backups.listFiles().length : 0);

            stats.put("timestamp", fechaActual());
            stats.put("success", true);

        } catch (Exception e) {
            stats.put("success", false);
            stats.put("mensaje", "Error al obtener estadísticas: " + e.getMessage());
        }

        return stats;
    }

    private void verificarYAgregarColumnaActivo() {
        try {
            String sql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'activo'";

            Integer existe = jdbcTemplate.queryForObject(sql, Integer.class);

            if (existe != null && existe == 0) {
                jdbcTemplate.execute("ALTER TABLE productos ADD COLUMN activo TINYINT(1) DEFAULT 1");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar o agregar columna activo", e);
        }
    }

    private String fechaActual() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
    }
}
