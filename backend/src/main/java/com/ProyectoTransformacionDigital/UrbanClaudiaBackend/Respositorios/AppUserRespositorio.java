package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Respositorios;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.*;


public interface AppUserRespositorio extends JpaRepository<AppUser,Integer> {
    public AppUser findByEmail(String email);
}
