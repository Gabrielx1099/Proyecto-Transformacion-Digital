package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Respositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.Proveedor;

@Repository
public interface ProveedorRepositorio extends JpaRepository<Proveedor, Integer> {
}