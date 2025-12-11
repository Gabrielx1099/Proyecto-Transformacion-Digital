package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Mantenimiento.backup;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class BackupService {
    
    private static final Logger logger = LoggerFactory.getLogger(BackupService.class);
    // Configuración externa con valores por defecto
@Value("${backup.directory:C:/Users/gv250/OneDrive/Escritorio/Transformacion-Digital-Backup}")
private String backupDir;

@Value("${backup.database.username:root}")
private String usuario;

@Value("${backup.database.name:bd_transformacion}") // Asegúrate de que coincida exactamente con el nombre de tu base de datos
private String baseDeDatos;

@Value("${backup.mysql.path:C:/xampp/mysql/bin/mysqldump.exe}")
private String mysqldumpPath;

    
    /**
     * Genera un backup completo de la base de datos
     * @return String con la ruta del archivo generado
     * @throws IOException si hay problemas con el proceso
     */
    public String generarBackup() throws IOException {
        try {
            // Validar que MySQL esté disponible
            validarMySQL();
            
            // Crear directorio de backup si no existe
            crearDirectorioBackup();
            
            // Generar nombre del archivo con timestamp
            String fecha = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String nombreArchivo = "backup_" + baseDeDatos + "_" + fecha + ".sql";
            String rutaCompleta = backupDir + File.separator + nombreArchivo;
            
            // Construir comando mysqldump (sin contraseña)
            String comando = String.format(
                "cmd /c %s -u%s --routines --triggers --single-transaction %s -r \"%s\"",
                mysqldumpPath, usuario, baseDeDatos, rutaCompleta
            );
            
            logger.info("Iniciando backup de la base de datos: {}", baseDeDatos);
            logger.debug("Comando ejecutado: {}", comando.replace(usuario, "***"));
            
            // Ejecutar el comando
            Process process = Runtime.getRuntime().exec(comando);
            
            // Capturar salida de error si la hay
            StringBuilder errorOutput = new StringBuilder();
            try (BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
            }
            
            // Esperar a que termine el proceso
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                String error = "Error al generar backup. Código de salida: " + exitCode;
                if (errorOutput.length() > 0) {
                    error += "\nDetalles: " + errorOutput.toString();
                }
                logger.error(error);
                throw new RuntimeException(error);
            }
            
            // Verificar que el archivo se haya creado correctamente
            File archivoBackup = new File(rutaCompleta);
            if (!archivoBackup.exists() || archivoBackup.length() == 0) {
                throw new RuntimeException("El archivo de backup no se generó correctamente o está vacío");
            }
            
            logger.info("✅ Backup generado exitosamente: {}", nombreArchivo);
            logger.info("📁 Ubicación: {}", rutaCompleta);
            logger.info("📏 Tamaño: {} KB", archivoBackup.length() / 1024);
            
            return rutaCompleta;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Proceso de backup interrumpido", e);
            throw new RuntimeException("Proceso de backup interrumpido", e);
        } catch (Exception e) {
            logger.error("Error inesperado durante el backup", e);
            throw new RuntimeException("Error durante el backup: " + e.getMessage(), e);
        }
    }
    
    /**
     * Valida que MySQL esté disponible en el sistema
     * @throws IOException si MySQL no está disponible
     */
    private void validarMySQL() throws IOException {
        try {
            logger.debug("Validando disponibilidad de MySQL...");
            Process process = Runtime.getRuntime().exec("cmd /c " + mysqldumpPath + " --version");
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                throw new RuntimeException("mysqldump no está disponible. Verifica que MySQL esté instalado y en el PATH");
            }
            
            logger.debug("✅ MySQL disponible");
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error validando MySQL", e);
        }
    }
    
    /**
     * Crea el directorio de backup si no existe
     * @throws IOException si no se puede crear el directorio
     */
    private void crearDirectorioBackup() throws IOException {
        File directorio = new File(backupDir);
        if (!directorio.exists()) {
            logger.info("Creando directorio de backup: {}", backupDir);
            boolean creado = directorio.mkdirs();
            if (!creado) {
                throw new IOException("No se pudo crear el directorio de backup: " + backupDir);
            }
        }
        
        // Verificar que el directorio sea escribible
        if (!directorio.canWrite()) {
            throw new IOException("El directorio de backup no tiene permisos de escritura: " + backupDir);
        }
    }
    
    /**
     * Genera un backup con opciones personalizadas
     * @param incluirDatos true para incluir datos, false solo estructura
     * @return String con la ruta del archivo generado
     * @throws IOException si hay problemas con el proceso
     */
    public String generarBackupPersonalizado(boolean incluirDatos) throws IOException {
    try {
        validarMySQL();
        crearDirectorioBackup();

        String fecha = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String tipo = incluirDatos ? "completo" : "estructura";
        String nombreArchivo = "backup_" + baseDeDatos + "_" + tipo + "_" + fecha + ".sql";
        String rutaCompleta = backupDir + File.separator + nombreArchivo;

        String opcionDatos = incluirDatos ? "" : "--no-data";

        String comando = String.format(
    "cmd /c \"\"%s\" -u%s %s %s --routines --triggers --single-transaction --result-file=\"%s\"\"",
    mysqldumpPath,
    usuario,
    opcionDatos,
    baseDeDatos,
    rutaCompleta
);


        logger.info("Iniciando backup {} de la base de datos: {}", tipo, baseDeDatos);
        logger.debug("🧪 Comando generado: {}", comando);

        Process process = Runtime.getRuntime().exec(comando);
        int exitCode = process.waitFor();

        // Leer error si existe
        StringBuilder errorOutput = new StringBuilder();
        try (BufferedReader errorReader = new BufferedReader(
                new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = errorReader.readLine()) != null) {
                errorOutput.append(line).append("\n");
            }
        }

        if (exitCode != 0) {
            String error = "Error al generar backup personalizado. Código: " + exitCode;
            if (errorOutput.length() > 0) {
                error += "\nDetalles: " + errorOutput.toString();
            }
            logger.error(error);
            throw new RuntimeException(error);
        }

        File archivoBackup = new File(rutaCompleta);
        if (!archivoBackup.exists() || archivoBackup.length() == 0) {
            throw new RuntimeException("El archivo de backup no se generó correctamente");
        }

        logger.info("✅ Backup {} generado exitosamente: {}", tipo, nombreArchivo);
        return rutaCompleta;

    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException("Proceso de backup interrumpido", e);
    }
}

    
    /**
     * Obtiene información sobre el directorio de backup
     * @return String con información del directorio
     */
    public String obtenerInfoDirectorio() {
        File directorio = new File(backupDir);
        if (!directorio.exists()) {
            return "El directorio de backup no existe: " + backupDir;
        }
        
        File[] archivos = directorio.listFiles((dir, name) -> name.startsWith("backup_") && name.endsWith(".sql"));
        int cantidadBackups = archivos != null ? archivos.length : 0;
        
        return String.format(
            "📁 Directorio de backup: %s\n" +
            "📊 Cantidad de backups: %d\n" +
            "✅ Directorio escribible: %s",
            backupDir, cantidadBackups, directorio.canWrite() ? "Sí" : "No"
        );
    }
}