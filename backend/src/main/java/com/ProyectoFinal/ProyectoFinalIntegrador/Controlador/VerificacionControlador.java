package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.AppUser;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.AppUserRespositorio;
import com.ProyectoFinal.ProyectoFinalIntegrador.util.EmailUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class VerificacionControlador {

    @Autowired
    private AppUserRespositorio userRepository;

    private final Map<String, String> codigosVerificacion = new HashMap<>();

    @PostMapping("/enviar-codigo")
    public ResponseEntity<?> enviarCodigoVerificacion(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        System.out.println("Intentando enviar código de verificación a: " + email);
        Map<String, Object> response = new HashMap<>();

        try {
            // Generar código de verificación
            String codigo = generarCodigoVerificacion();
            codigosVerificacion.put(email, codigo);
            System.out.println("Código generado para " + email + ": " + codigo);

            // Enviar email con el código
            EmailUtil.enviarCodigoVerificacion(email, codigo);

            response.put("success", true);
            response.put("message", "Código de verificación enviado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error al enviar código: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error al enviar el código de verificación: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String codigo = request.get("codigo");
        System.out.println("Intentando verificar código para: " + email);
        System.out.println("Código recibido: " + codigo);
        System.out.println("Códigos almacenados: " + codigosVerificacion);
        
        Map<String, Object> response = new HashMap<>();

        AppUser user = userRepository.findByEmail(email);
        if (user == null) {
            response.put("success", false);
            response.put("message", "Usuario no encontrado");
            return ResponseEntity.badRequest().body(response);
        }

        if (!codigo.equals(user.getCodigoVerificacion())) {
            response.put("success", false);
            response.put("message", "Código de verificación incorrecto");
            return ResponseEntity.badRequest().body(response);
        }

        // Actualizar el estado de verificación del usuario
        user.setVerificado(true);
        user.setCodigoVerificacion(null); // Borra el código
        userRepository.save(user);
        System.out.println("Usuario verificado exitosamente: " + email);

        response.put("success", true);
        response.put("message", "Email verificado exitosamente");
        return ResponseEntity.ok(response);
    }

    private String generarCodigoVerificacion() {
        Random random = new Random();
        int codigo = 100000 + random.nextInt(900000); // Genera un número de 6 dígitos
        return String.valueOf(codigo);
    }
} 