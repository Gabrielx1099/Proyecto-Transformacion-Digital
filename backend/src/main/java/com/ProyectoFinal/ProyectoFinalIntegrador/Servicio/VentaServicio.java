package com.ProyectoFinal.ProyectoFinalIntegrador.Servicio;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Venta;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.DetalleVenta;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.VentaRepositorio;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.DetalleVentaRepositorio;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.base.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VentaServicio {
    @Autowired
    private VentaRepositorio ventaRepositorio;
    @Autowired
    private DetalleVentaRepositorio detalleVentaRepositorio;

    public Venta obtenerCarritoActivo(int idUsuario) {

        return ventaRepositorio.findByIdUsuarioAndTotalIsNullAndEstado(idUsuario, "PENDIENTE");
    }

    public Venta crearCarrito(int idUsuario) {
        Venta existente = obtenerCarritoActivo(idUsuario);
        if (existente != null) {
            return existente;
        }

        Venta venta = new Venta();
        venta.setIdUsuario(idUsuario);
        venta.setEstado("PENDIENTE");
        venta.setTotal(null);
        return ventaRepositorio.save(venta);
    }

    public List<DetalleVenta> obtenerDetallesPorVenta(int idVenta) {
        Preconditions.checkArgument(idVenta > 0, "El ID de venta debe ser positivo");
        List<DetalleVenta> detalles = detalleVentaRepositorio.findByVenta_IdVenta(idVenta);
        return ImmutableList.copyOf(detalles);
    }

    public DetalleVenta agregarDetalle(int idVenta, DetalleVenta detalle) {
        Preconditions.checkArgument(idVenta > 0, "El ID de venta debe ser positivo");
        Preconditions.checkNotNull(detalle, "El detalle no puede ser nulo");
        Preconditions.checkArgument(detalle.getId_producto() > 0, "El ID de producto debe ser positivo");
        Preconditions.checkArgument(detalle.getCantidad() > 0, "La cantidad debe ser positiva");

        int idProducto = detalle.getId_producto();
        DetalleVenta existente = detalleVentaRepositorio.findByVentaAndProducto(idVenta, idProducto);

        if (existente != null) {
            existente.setCantidad(existente.getCantidad() + detalle.getCantidad());
            return detalleVentaRepositorio.save(existente);
        } else {
            Venta venta = ventaRepositorio.findById(idVenta)
                                        .orElseThrow(() -> new RuntimeException("Venta not found"));
            detalle.setVenta(venta);
            return detalleVentaRepositorio.save(detalle);
        }
    }

    public void eliminarDetalle(int idDetalle) {
        Preconditions.checkArgument(idDetalle > 0, "El ID de detalle debe ser positivo");
        detalleVentaRepositorio.deleteById(idDetalle);
    }

    public DetalleVenta actualizarCantidadDetalle(int idDetalle, int cantidad) {
        Preconditions.checkArgument(idDetalle > 0, "El ID de detalle debe ser positivo");
        Preconditions.checkArgument(cantidad > 0, "La cantidad debe ser positiva");

        return detalleVentaRepositorio.findById(idDetalle)
                .map(detalle -> {
                    detalle.setCantidad(cantidad);
                    return detalleVentaRepositorio.save(detalle);
                })
                .orElse(null);
    }

    public Venta finalizarVenta(Venta venta) {
        Preconditions.checkNotNull(venta, "La venta no puede ser nula");
        Preconditions.checkArgument(venta.getIdUsuario() > 0, "El ID de usuario debe ser positivo");
        return ventaRepositorio.save(venta);
    }

    public void vaciarCarrito(int idVenta) {
        detalleVentaRepositorio.deleteByVenta_IdVenta(idVenta);
    }
} 