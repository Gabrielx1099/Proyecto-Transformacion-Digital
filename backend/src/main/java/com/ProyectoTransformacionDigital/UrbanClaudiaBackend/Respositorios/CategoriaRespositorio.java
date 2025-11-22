package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Respositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.Categoria;

@Repository
public interface CategoriaRespositorio extends JpaRepository<Categoria, Integer> {
} 