package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.backup;


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
@RequestMapping("/api/mantenimiento/backup")
@CrossOrigin(origins = "*") // Ajusta según tu frontend
public class BackupController {
    
    private static final Logger logger = LoggerFactory.getLogger(BackupController.class);
    
    @Autowired
    private BackupService backupService;
    
    /**
     * Endpoint para ejecutar backup completo manualmente desde el frontend
     * @return ResponseEntity con información del backup generado
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> generarBackup() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Solicitud de backup recibida");
            
            String rutaArchivo = backupService.generarBackup();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            
            response.put("success", true);
            response.put("message", "Backup generado correctamente");
            response.put("timestamp", timestamp);
            response.put("archivo", rutaArchivo);
            response.put("status", "COMPLETADO");
            
            logger.info("Backup generado exitosamente: {}", rutaArchivo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al generar backup", e);
            
            response.put("success", false);
            response.put("message", "Error al generar backup: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            response.put("error", e.getClass().getSimpleName());
            response.put("status", "ERROR");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Endpoint para backup personalizado (solo estructura o completo)
     * @param incluirDatos true para incluir datos, false solo estructura
     * @return ResponseEntity con información del backup generado
     */
    @PostMapping("/personalizado")
    public ResponseEntity<Map<String, Object>> generarBackupPersonalizado(
            @RequestParam(defaultValue = "true") boolean incluirDatos) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Solicitud de backup personalizado recibida - Incluir datos: {}", incluirDatos);
            
            String rutaArchivo = backupService.generarBackupPersonalizado(incluirDatos);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            String tipo = incluirDatos ? "completo" : "estructura";
            
            response.put("success", true);
            response.put("message", "Backup " + tipo + " generado correctamente");
            response.put("timestamp", timestamp);
            response.put("archivo", rutaArchivo);
            response.put("tipo", tipo);
            response.put("status", "COMPLETADO");
            
            logger.info("Backup {} generado exitosamente: {}", tipo, rutaArchivo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al generar backup personalizado", e);
            
            response.put("success", false);
            response.put("message", "Error al generar backup personalizado: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            response.put("error", e.getClass().getSimpleName());
            response.put("status", "ERROR");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Endpoint para obtener información del directorio de backup
     * @return ResponseEntity con información del directorio
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> obtenerInfoBackup() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.debug("Solicitud de información de backup recibida");
            
            String info = backupService.obtenerInfoDirectorio();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            
            response.put("success", true);
            response.put("message", "Información obtenida correctamente");
            response.put("timestamp", timestamp);
            response.put("info", info);
            response.put("status", "OK");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al obtener información de backup", e);
            
            response.put("success", false);
            response.put("message", "Error al obtener información: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            response.put("error", e.getClass().getSimpleName());
            response.put("status", "ERROR");
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Endpoint para verificar el estado del servicio de backup
     * @return ResponseEntity con el estado del servicio
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> verificarEstado() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            
            response.put("success", true);
            response.put("message", "Servicio de backup operativo");
            response.put("timestamp", timestamp);
            response.put("service", "BackupService");
            response.put("status", "ACTIVO");
            response.put("version", "1.0");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al verificar estado del servicio", e);
            
            response.put("success", false);
            response.put("message", "Error en el servicio: " + e.getMessage());
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            response.put("status", "ERROR");
            
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
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
        
        logger.error("Error no manejado en BackupController", ex);
        
        response.put("success", false);
        response.put("message", "Error interno del servidor");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        response.put("error", ex.getClass().getSimpleName());
        response.put("status", "ERROR_INTERNO");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}