package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.programado;


import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.backup.BackupService;
import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.limpieza.LimpiezaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Component
public class CronTasks {

    private static final Logger logger = LoggerFactory.getLogger(CronTasks.class);

    private final BackupService backupService;
    private final LimpiezaService limpiezaService;

    public CronTasks(BackupService backupService, LimpiezaService limpiezaService) {
        this.backupService = backupService;
        this.limpiezaService = limpiezaService;
    }

    // 🕑 Mantenimiento diario a las 9:45 am
    @Scheduled(cron = "0 37 19 * * ?", zone = "America/Lima")
    public void mantenimientoDiario() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        try {
            logger.info("🕑 Ejecutando mantenimiento diario - {}", timestamp);

            logger.info("📋 Paso 1: Generando backup...");
            try {
                String ruta = backupService.generarBackup();
                logger.info("✅ Backup generado: {}", ruta);
            } catch (Exception e) {
                logger.error("❌ Error en backup: {}", e.getMessage());
            }

            logger.info("🧹 Paso 2: Marcar productos sin stock...");
            try {
                Map<String, Object> r = limpiezaService.marcarProductosSinStockComoInactivos();
                logger.info("✅ Productos procesados: {}", r.get("productosAfectados"));
            } catch (Exception e) {
                logger.error("❌ Error en productos: {}", e.getMessage());
            }

            logger.info("🗑️ Paso 3: Limpiar logs antiguos...");
            try {
                Map<String, Object> r = limpiezaService.limpiarLogsAntiguos();
                logger.info("✅ Logs eliminados: {}", r.get("archivosEliminados"));
            } catch (Exception e) {
                logger.error("❌ Error en logs: {}", e.getMessage());
            }

        } catch (Exception e) {
            logger.error("❌ Error crítico en mantenimiento diario: {}", e.getMessage());
        }
    }

    // 🗓️ Mantenimiento semanal - domingos a las 10:10 PM
    @Scheduled(cron = "0 37 19 * * SUN", zone = "America/Lima")
    public void mantenimientoSemanal() {
        try {
            logger.info("🗓️ Mantenimiento semanal iniciado");

            logger.info("💾 Backup completo semanal...");
            try {
                String ruta = backupService.generarBackupPersonalizado(true);
                logger.info("✅ Backup completo: {}", ruta);
            } catch (Exception e) {
                logger.error("❌ Backup semanal fallido: {}", e.getMessage());
            }

            logger.info("🧽 Limpieza de backups antiguos...");
            try {
                Map<String, Object> r = limpiezaService.limpiarBackupsAntiguos();
                logger.info("✅ Backups eliminados: {}", r.get("archivosEliminados"));
            } catch (Exception e) {
                logger.error("❌ Error limpiando backups: {}", e.getMessage());
            }

            logger.info("🔄 Limpieza completa del sistema...");
            try {
                Map<String, Object> r = limpiezaService.ejecutarLimpiezaCompleta();
                logger.info("✅ Limpieza completa ejecutada correctamente");
            } catch (Exception e) {
                logger.error("❌ Error en limpieza completa: {}", e.getMessage());
            }

        } catch (Exception e) {
            logger.error("❌ Error crítico semanal: {}", e.getMessage());
        }
    }

    // 🚨 Backup emergencia también a las 10:10 PM (por simplicidad)
    @Scheduled(cron = "0 37 19 * * ?", zone = "America/Lima")
    public void backupEmergencia() {
        try {
            logger.info("🚨 Backup de emergencia...");
            String ruta = backupService.generarBackupPersonalizado(false);
            logger.info("✅ Emergencia: {}", ruta);
        } catch (Exception e) {
            logger.error("❌ Backup emergencia fallido: {}", e.getMessage());
        }
    }

    // 🔍 Monitoreo horario - a las 10:10 PM
    @Scheduled(cron = "0 37 19 * * ?", zone = "America/Lima")
    public void monitoreoHorario() {
        try {
            logger.info("🔍 Monitoreo horario del sistema...");
            Map<String, Object> e = limpiezaService.obtenerEstadisticasLimpieza();
            logger.info("📊 Stats: {}", e);
        } catch (Exception e) {
            logger.error("❌ Monitoreo fallido: {}", e.getMessage());
        }
    }

    // ⏰ Mostrar tareas activas al iniciar
    @Scheduled(initialDelay = 5000, fixedDelay = Long.MAX_VALUE)
    public void mostrarInformacionTareas() {
        logger.info("⏰ TAREAS PROGRAMADAS ACTIVAS:");
        logger.info("⏰ • Mantenimiento diario: 10:10 PM");
        logger.info("⏰ • Mantenimiento semanal: Domingo 10:10 PM");
        logger.info("⏰ • Backup emergencia: 10:10 PM");
        logger.info("⏰ • Monitoreo horario: 10:10 PM");
    }
}
