package com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VentaRepositorio extends JpaRepository<Venta, Integer> {
    List<Venta> findByIdUsuario(int idUsuario);
    Venta findByIdUsuarioAndTotalIsNull(int idUsuario); // Solo carritos activos (sin total)
    Venta findByIdUsuarioAndTotalIsNullAndEstado(int idUsuario, String estado);
} 