package com.ProyectoTransformacionDigital.UrbanClaudiaBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
public class UrbanClaudiaApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrbanClaudiaApplication.class, args);
                  // Mensaje de confirmación
        System.out.println(" Aplicacion iniciada con tareas programadas habilitadas");
        System.out.println("⏰ Mantenimiento diario programado en ejecucion");
    
	}

}
