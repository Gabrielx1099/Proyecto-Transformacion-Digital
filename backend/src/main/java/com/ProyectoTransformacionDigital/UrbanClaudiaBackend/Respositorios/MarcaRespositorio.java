package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Respositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.Marca;

@Repository
public interface MarcaRespositorio extends JpaRepository<Marca, Integer> {
} 