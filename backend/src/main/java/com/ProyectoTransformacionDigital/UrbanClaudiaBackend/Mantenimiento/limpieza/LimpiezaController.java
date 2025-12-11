package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.limpieza;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mantenimiento/limpieza")
@CrossOrigin(origins = "*") // Ajusta según tu frontend
public class LimpiezaController {
    
    private static final Logger logger = LoggerFactory.getLogger(LimpiezaController.class);
    
    @Autowired
    private LimpiezaService limpiezaService;
    
    /**
     * Marca productos con stock = 0 como inactivos (método recomendado)
     * @return ResponseEntity con resultado de la operación
     */
    @PostMapping("/productos/marcar-inactivos")
    public ResponseEntity<Map<String, Object>> marcarProductosSinStockComoInactivos() {
        try {
            logger.info("Solicitud para marcar productos sin stock como inactivos");
            
            Map<String, Object> resultado = limpiezaService.marcarProductosSinStockComoInactivos();
            
            if ((Boolean) resultado.get("success")) {
                logger.info("Productos marcados como inactivos exitosamente");
                return ResponseEntity.ok(resultado);
            } else {
                logger.error("Error al marcar productos como inactivos: {}", resultado.get("mensaje"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resultado);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado al marcar productos como inactivos", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Elimina productos con stock = 0 (solo si está habilitado en configuración)
     * @return ResponseEntity con resultado de la operación
     */
    @PostMapping("/productos/eliminar")
    public ResponseEntity<Map<String, Object>> eliminarProductosSinStock() {
        try {
            logger.info("Solicitud para eliminar productos sin stock");
            
            Map<String, Object> resultado = limpiezaService.eliminarProductosSinStock();
            
            if ((Boolean) resultado.get("success")) {
                logger.info("Productos eliminados exitosamente");
                return ResponseEntity.ok(resultado);
            } else {
                logger.warn("No se pudieron eliminar productos: {}", resultado.get("mensaje"));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resultado);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado al eliminar productos", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Ejecuta limpieza de archivos de logs antiguos
     * @return ResponseEntity con resultado de la operación
     */
    @PostMapping("/logs")
    public ResponseEntity<Map<String, Object>> limpiarLogsAntiguos() {
        try {
            logger.info("Solicitud para limpiar logs antiguos");
            
            Map<String, Object> resultado = limpiezaService.limpiarLogsAntiguos();
            
            if ((Boolean) resultado.get("success")) {
                logger.info("Logs antiguos limpiados exitosamente");
                return ResponseEntity.ok(resultado);
            } else {
                logger.error("Error al limpiar logs: {}", resultado.get("mensaje"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resultado);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado al limpiar logs", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Ejecuta limpieza de archivos de backup antiguos
     * @return ResponseEntity con resultado de la operación
     */
    @PostMapping("/backups")
    public ResponseEntity<Map<String, Object>> limpiarBackupsAntiguos() {
        try {
            logger.info("Solicitud para limpiar backups antiguos");
            
            Map<String, Object> resultado = limpiezaService.limpiarBackupsAntiguos();
            
            if ((Boolean) resultado.get("success")) {
                logger.info("Backups antiguos limpiados exitosamente");
                return ResponseEntity.ok(resultado);
            } else {
                logger.error("Error al limpiar backups: {}", resultado.get("mensaje"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resultado);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado al limpiar backups", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Ejecuta limpieza completa del sistema
     * @return ResponseEntity con resultado de todas las operaciones
     */
    @PostMapping("/completa")
    public ResponseEntity<Map<String, Object>> ejecutarLimpiezaCompleta() {
        try {
            logger.info("Solicitud para ejecutar limpieza completa del sistema");
            
            Map<String, Object> resultado = limpiezaService.ejecutarLimpiezaCompleta();
            
            if ((Boolean) resultado.get("success")) {
                logger.info("Limpieza completa ejecutada exitosamente");
                return ResponseEntity.ok(resultado);
            } else {
                logger.error("Error en limpieza completa: {}", resultado.get("mensaje"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resultado);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado en limpieza completa", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Obtiene estadísticas del sistema de limpieza
     * @return ResponseEntity con estadísticas generales
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            logger.debug("Solicitud para obtener estadísticas de limpieza");
            
            Map<String, Object> estadisticas = limpiezaService.obtenerEstadisticasLimpieza();
            
            if ((Boolean) estadisticas.get("success")) {
                return ResponseEntity.ok(estadisticas);
            } else {
                logger.error("Error al obtener estadísticas: {}", estadisticas.get("mensaje"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(estadisticas);
            }
            
        } catch (Exception e) {
            logger.error("Error inesperado al obtener estadísticas", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error inesperado: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("error", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Endpoint para verificar el estado del servicio de limpieza
     * @return ResponseEntity con el estado del servicio
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> verificarEstado() {
        try {
            Map<String, Object> response = new HashMap<>();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            
            response.put("success", true);
            response.put("mensaje", "Servicio de limpieza operativo");
            response.put("timestamp", timestamp);
            response.put("service", "LimpiezaService");
            response.put("status", "ACTIVO");
            response.put("version", "1.0");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al verificar estado del servicio de limpieza", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("mensaje", "Error en el servicio: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            errorResponse.put("status", "ERROR");
            
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }
    
    /**
     * Endpoint para manejo de errores específicos
     * @param ex Exception capturada
     * @return ResponseEntity con información del error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarErrores(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        
        logger.error("Error no manejado en LimpiezaController", ex);
        
        response.put("success", false);
        response.put("mensaje", "Error interno del servidor");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        response.put("error", ex.getClass().getSimpleName());
        response.put("status", "ERROR_INTERNO");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}