package com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DetalleVentaRepositorio extends JpaRepository<DetalleVenta, Integer> {
    List<DetalleVenta> findByVenta_IdVenta(int idVenta);
    @Query("SELECT d FROM DetalleVenta d WHERE d.venta.idVenta = :idVenta AND d.id_producto = :idProducto")
    DetalleVenta findByVentaAndProducto(@Param("idVenta") int idVenta, @Param("idProducto") int idProducto);
    void deleteByVenta_IdVenta(int idVenta);
} 