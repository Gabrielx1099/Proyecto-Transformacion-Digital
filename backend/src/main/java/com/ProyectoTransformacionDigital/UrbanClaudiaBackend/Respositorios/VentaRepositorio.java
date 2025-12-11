package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Respositorios;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.Venta;

import java.util.List;

public interface VentaRepositorio extends JpaRepository<Venta, Integer> {
    List<Venta> findByIdUsuario(int idUsuario);
    Venta findByIdUsuarioAndTotalIsNull(int idUsuario); // Solo carritos activos (sin total)
    Venta findByIdUsuarioAndTotalIsNullAndEstado(int idUsuario, String estado);
} 