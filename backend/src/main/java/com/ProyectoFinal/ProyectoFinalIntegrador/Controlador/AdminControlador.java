package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.AppUser;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.RegistroDto;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.AppUserRespositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminControlador {

    // Logger para registrar eventos y errores
    private static final Logger logger = LoggerFactory.getLogger(AdminControlador.class);

    @Autowired
    private AppUserRespositorio repo;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarAdmin(@RequestBody RegistroDto registroDto) {
        logger.info("=== INICIO REGISTRO ADMINISTRADOR ===");
        logger.info("Intentando registrar administrador con email: {}", registroDto.getEmail());
        
        Map<String, Object> response = new HashMap<>();

        try {
            // Validación de contraseñas
            if (!registroDto.getContraseña().equals(registroDto.getConfirmarcontraseña())) {
                logger.warn("Error de validación: Las contraseñas no coinciden para email: {}", registroDto.getEmail());
                response.put("success", false);
                response.put("message", "Las contraseñas no coinciden");
                return ResponseEntity.badRequest().body(response);
            }
            logger.debug("Validación de contraseñas exitosa para email: {}", registroDto.getEmail());

            // Validación de email existente
            logger.debug("Verificando si el email {} ya existe en la base de datos", registroDto.getEmail());
            AppUser appUser = repo.findByEmail(registroDto.getEmail());
            if (appUser != null) {
                logger.warn("Intento de registro con email duplicado: {} - Usuario existente ID: {}", 
                           registroDto.getEmail(), appUser.getId());
                response.put("success", false);
                response.put("message", "Esta dirección de correo ya está en uso");
                return ResponseEntity.badRequest().body(response);
            }
            logger.debug("Email {} disponible para registro", registroDto.getEmail());

            // Proceso de registro
            logger.info("Iniciando proceso de creación de usuario administrador");
            var bCryptEncoder = new BCryptPasswordEncoder();
            AppUser newUser = new AppUser();
            
            newUser.setNombre(registroDto.getNombre());
            newUser.setApellidos(registroDto.getApellidos());
            newUser.setEmail(registroDto.getEmail());
            newUser.setTelefono(registroDto.getTelefono());
            newUser.setDireccion(registroDto.getDireccion());
            newUser.setRol("admin"); // Rol específico para administradores
            newUser.setFechacreacion(new Date());
            newUser.setContraseña(bCryptEncoder.encode(registroDto.getContraseña()));
            
            logger.debug("Datos del nuevo usuario preparados. Guardando en base de datos...");
            AppUser usuarioGuardado = repo.save(newUser);
            
            logger.info("✅ ADMINISTRADOR REGISTRADO EXITOSAMENTE");
            logger.info("ID generado: {}, Email: {}, Nombre: {} {}", 
                       usuarioGuardado.getId(), 
                       usuarioGuardado.getEmail(), 
                       usuarioGuardado.getNombre(), 
                       usuarioGuardado.getApellidos());

            response.put("success", true);
            response.put("message", "Administrador registrado correctamente");
            response.put("userId", usuarioGuardado.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception ex) {
            logger.error("❌ ERROR CRÍTICO durante el registro del administrador");
            logger.error("Email intentado: {}", registroDto.getEmail());
            logger.error("Tipo de error: {}", ex.getClass().getSimpleName());
            logger.error("Mensaje de error: {}", ex.getMessage());
            logger.error("Stack trace completo: ", ex);
            
            response.put("success", false);
            response.put("message", "Error interno del servidor. Contacte al administrador.");
            response.put("errorDetails", ex.getMessage()); // Solo para desarrollo
            
            return ResponseEntity.badRequest().body(response);
        } finally {
            logger.info("=== FIN PROCESO REGISTRO ADMINISTRADOR ===");
        }
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<AppUser>> obtenerTodosLosUsuarios() {
        logger.info("📋 Solicitando lista completa de usuarios");
        
        try {
            logger.debug("Ejecutando consulta para obtener todos los usuarios");
            List<AppUser> usuarios = repo.findAll();
            
            logger.info("✅ Lista de usuarios obtenida exitosamente. Total usuarios: {}", usuarios.size());
            logger.debug("Usuarios encontrados por rol:");
            
            // Contar usuarios por rol para logs informativos
            long admins = usuarios.stream().filter(u -> "admin".equals(u.getRol())).count();
            long clientes = usuarios.stream().filter(u -> "cliente".equals(u.getRol())).count();
            
            logger.debug("- Administradores: {}", admins);
            logger.debug("- Clientes: {}", clientes);
            
            return ResponseEntity.ok(usuarios);
            
        } catch (Exception ex) {
            logger.error("❌ ERROR al obtener la lista de usuarios");
            logger.error("Tipo de error: {}", ex.getClass().getSimpleName());
            logger.error("Mensaje: {}", ex.getMessage());
            logger.error("Detalles: ", ex);
            
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<AppUser> obtenerUsuarioPorId(@PathVariable int id) {
        logger.info("🔍 Buscando usuario por ID: {}", id);
        
        try {
            logger.debug("Ejecutando búsqueda en base de datos para ID: {}", id);
            AppUser usuario = repo.findById(id).orElse(null);
            
            if (usuario != null) {
                logger.info("✅ Usuario encontrado - ID: {}, Email: {}, Rol: {}", 
                           usuario.getId(), usuario.getEmail(), usuario.getRol());
                return ResponseEntity.ok(usuario);
            } else {
                logger.warn("⚠️ Usuario no encontrado con ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception ex) {
            logger.error("❌ ERROR al buscar usuario por ID: {}", id);
            logger.error("Tipo de error: {}", ex.getClass().getSimpleName());
            logger.error("Mensaje: {}", ex.getMessage());
            logger.error("Detalles: ", ex);
            
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!repo.existsById(id)) {
                response.put("success", false);
                response.put("message", "Usuario no encontrado");
                return ResponseEntity.badRequest().body(response);
            }
            repo.deleteById(id);
            response.put("success", true);
            response.put("message", "Usuario eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", "Error al eliminar usuario");
            response.put("errorDetails", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> editarUsuario(@PathVariable int id, @RequestBody Map<String, Object> datos) {
        Map<String, Object> response = new HashMap<>();
        try {
            AppUser usuario = repo.findById(id).orElse(null);
            if (usuario == null) {
                response.put("success", false);
                response.put("message", "Usuario no encontrado");
                return ResponseEntity.badRequest().body(response);
            }
            if (datos.containsKey("nombre")) usuario.setNombre((String) datos.get("nombre"));
            if (datos.containsKey("apellidos")) usuario.setApellidos((String) datos.get("apellidos"));
            if (datos.containsKey("email")) usuario.setEmail((String) datos.get("email"));
            if (datos.containsKey("telefono")) usuario.setTelefono((String) datos.get("telefono"));
            if (datos.containsKey("direccion")) usuario.setDireccion((String) datos.get("direccion"));
            repo.save(usuario);
            response.put("success", true);
            response.put("message", "Usuario editado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", "Error al editar usuario");
            response.put("errorDetails", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
