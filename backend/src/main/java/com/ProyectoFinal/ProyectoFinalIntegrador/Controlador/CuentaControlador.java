package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.AppUser;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.RegistroDto;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.AppUserRespositorio;
import com.ProyectoFinal.ProyectoFinalIntegrador.util.EmailUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

// Importaciones de Google Guava
import com.google.common.base.Strings;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
public class CuentaControlador {

    @Autowired
    private AppUserRespositorio repo;

    // Usar Guava Maps para crear el mapa de códigos de verificación
    private final Map<String, String> codigosVerificacion = Maps.newConcurrentMap();

    // Cache para códigos de verificación con expiración automática (interno)
    private final Cache<String, String> codigosCache = CacheBuilder.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(15, TimeUnit.MINUTES) // Los códigos expiran en 15 minutos
            .build();

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody RegistroDto registroDto) {
        System.out.println("Intentando registrar usuario...");
        
        // Usar Guava Maps para crear el response
        Map<String, Object> response = Maps.newHashMap();

        try {
            // Validar el DTO usando Preconditions de Guava
            Preconditions.checkNotNull(registroDto, "Los datos de registro no pueden ser null");
            Preconditions.checkNotNull(registroDto.getEmail(), "El email no puede ser null");
            Preconditions.checkNotNull(registroDto.getContraseña(), "La contraseña no puede ser null");
            Preconditions.checkNotNull(registroDto.getConfirmarcontraseña(), "La confirmación de contraseña no puede ser null");

            // Validación de contraseñas usando Strings de Guava
            String contraseña = Strings.nullToEmpty(registroDto.getContraseña());
            String confirmarContraseña = Strings.nullToEmpty(registroDto.getConfirmarcontraseña());
            
            if (!contraseña.equals(confirmarContraseña)) {
                response.put("success", false);
                response.put("message", "Las contraseñas no coinciden");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de email usando Strings de Guava (más robusto que StringUtils)
            String email = Strings.nullToEmpty(registroDto.getEmail()).trim();
            if (Strings.isNullOrEmpty(email)) {
                response.put("success", false);
                response.put("message", "El email no puede estar vacío");
                return ResponseEntity.badRequest().body(response);
            }

            // Validar repositorio usando Preconditions
            Preconditions.checkNotNull(repo, "El repositorio no puede ser null");

            // Validación de email existente
            AppUser appUser = repo.findByEmail(email);
            if (appUser != null) {
                response.put("success", false);
                response.put("message", "Esta dirección de correo ya está en uso");
                return ResponseEntity.badRequest().body(response);
            }

            // Validaciones adicionales usando Strings de Guava
            String nombre = Strings.nullToEmpty(registroDto.getNombre()).trim();
            String apellidos = Strings.nullToEmpty(registroDto.getApellidos()).trim();
            
            if (Strings.isNullOrEmpty(nombre)) {
                response.put("success", false);
                response.put("message", "El nombre no puede estar vacío");
                return ResponseEntity.badRequest().body(response);
            }

            var bCryptEncoder = new BCryptPasswordEncoder();
            AppUser newUser = new AppUser();
            
            // Usar Strings.nullToEmpty para manejo seguro de strings
            newUser.setNombre(nombre);
            newUser.setApellidos(apellidos);
            newUser.setEmail(email);
            newUser.setTelefono(Strings.nullToEmpty(registroDto.getTelefono()).trim());
            newUser.setDireccion(Strings.nullToEmpty(registroDto.getDireccion()).trim());
            newUser.setRol("cliente");
            newUser.setFechacreacion(new Date());
            newUser.setContraseña(bCryptEncoder.encode(contraseña));
            newUser.setVerificado(false);
            
            String codigo = generarCodigoVerificacion();
            newUser.setCodigoVerificacion(codigo);
            
            // Guardar en cache para referencia futura
            codigosCache.put(email, codigo);
            
            repo.save(newUser);
            EmailUtil.enviarCodigoVerificacion(email, codigo);

            response.put("success", true);
            response.put("message", "Usuario registrado correctamente. Se ha enviado un código de verificación a tu correo electrónico.");
            return ResponseEntity.ok(response);
            
        } catch (NullPointerException | IllegalArgumentException e) {
            // Manejo específico de errores de validación de Preconditions
            response.put("success", false);
            response.put("message", "Datos de registro inválidos: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception ex) {
            System.err.println("Error en registro: " + ex.getMessage());
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.badRequest().body(response);
        }
    }

    private String generarCodigoVerificacion() {
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000); // Genera un número de 6 dígitos
        return String.valueOf(codigo);
    }

    // Método adicional para limpiar códigos expirados del cache (interno)
    private void limpiarCodigosExpirados() {
        codigosCache.cleanUp();
    }
}