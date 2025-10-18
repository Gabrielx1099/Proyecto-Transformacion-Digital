package com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.*;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AppUserRespositorio extends JpaRepository<AppUser,Integer> {
    public AppUser findByEmail(String email);
}
