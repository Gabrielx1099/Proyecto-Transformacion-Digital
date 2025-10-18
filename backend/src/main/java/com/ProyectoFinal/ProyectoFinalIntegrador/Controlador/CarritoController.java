package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Venta;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.DetalleVenta;
import com.ProyectoFinal.ProyectoFinalIntegrador.Servicio.VentaServicio;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    // Clase interna para la solicitud de agregar detalle
    static class AgregarDetalleRequest {
        private int idVenta;
        private int id_producto;
        private int cantidad;

        // Getters y Setters
        public int getIdVenta() {
            return idVenta;
        }

        public void setIdVenta(int idVenta) {
            this.idVenta = idVenta;
        }

        public int getId_producto() {
            return id_producto;
        }

        public void setId_producto(int id_producto) {
            this.id_producto = id_producto;
        }

        public int getCantidad() {
            return cantidad;
        }

        public void setCantidad(int cantidad) {
            this.cantidad = cantidad;
        }
    }

    @Autowired
    private VentaServicio ventaServicio;

    // Endpoint para obtener el carrito activo
    @GetMapping("/activo/{idUsuario}")

    public ResponseEntity<?> obtenerCarritoActivo(@PathVariable int idUsuario) {
        Venta carrito = ventaServicio.obtenerCarritoActivo(idUsuario);
        if (carrito == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No active cart found for this user.");

        }
        return ResponseEntity.ok(carrito);
    }

    // Endpoint para crear un nuevo carrito
    @PostMapping

    public Venta crearCarrito(@RequestBody Map<String, Integer> body) {
        int idUsuario = body.get("idUsuario");
        return ventaServicio.crearCarrito(idUsuario);

    }

    // Endpoint para agregar un detalle a un carrito existente
    @PostMapping("/detalle")
    public DetalleVenta agregarDetalle(@RequestBody AgregarDetalleRequest request) {
        Preconditions.checkNotNull(request, "La solicitud no puede ser nula");
        Preconditions.checkArgument(request.getIdVenta() > 0, "El ID de venta debe ser positivo");
        Preconditions.checkArgument(request.getId_producto() > 0, "El ID de producto debe ser positivo");
        Preconditions.checkArgument(request.getCantidad() > 0, "La cantidad debe ser positiva");

        DetalleVenta nuevoDetalle = new DetalleVenta();
        nuevoDetalle.setId_producto(request.getId_producto());
        nuevoDetalle.setCantidad(request.getCantidad());

        return ventaServicio.agregarDetalle(request.getIdVenta(), nuevoDetalle);
    }

    // Eliminar producto del carrito
    @DeleteMapping("/detalle/{idDetalle}")
    public void eliminarDetalle(@PathVariable int idDetalle) {
        Preconditions.checkArgument(idDetalle > 0, "El ID de detalle debe ser positivo");
        ventaServicio.eliminarDetalle(idDetalle);
    }

    // Endpoint para aumentar la cantidad de un detalle
    @PutMapping("/detalle/{idDetalle}/aumentar")
    public DetalleVenta aumentarCantidadDetalle(@PathVariable int idDetalle, @RequestBody DetalleVenta detalleActualizado) {
        Preconditions.checkArgument(idDetalle > 0, "El ID de detalle debe ser positivo");
        Preconditions.checkNotNull(detalleActualizado, "El detalle actualizado no puede ser nulo");
        Preconditions.checkArgument(detalleActualizado.getCantidad() > 0, "La cantidad debe ser positiva");

        return ventaServicio.actualizarCantidadDetalle(idDetalle, detalleActualizado.getCantidad());
    }

    // Endpoint para disminuir la cantidad de un detalle
    @PutMapping("/detalle/{idDetalle}/disminuir")
    public ResponseEntity<?> disminuirCantidadDetalle(@PathVariable int idDetalle, @RequestBody DetalleVenta detalleActualizado) {
        Preconditions.checkArgument(idDetalle > 0, "El ID de detalle debe ser positivo");
        Preconditions.checkNotNull(detalleActualizado, "El detalle actualizado no puede ser nulo");

        int nuevaCantidad = detalleActualizado.getCantidad();
        if (nuevaCantidad <= 0) {
            ventaServicio.eliminarDetalle(idDetalle);
            return ResponseEntity.ok().build();
        } else {
            DetalleVenta detalleModificado = ventaServicio.actualizarCantidadDetalle(idDetalle, nuevaCantidad);
            return detalleModificado != null 
                ? ResponseEntity.ok(detalleModificado)
                : ResponseEntity.notFound().build();
        }
    }

    // Finalizar compra
    @PostMapping("/{idUsuario}/finalizar")
    public Venta finalizarCompra(@PathVariable int idUsuario, @RequestBody Venta venta) {
        Preconditions.checkArgument(idUsuario > 0, "El ID de usuario debe ser positivo");
        Preconditions.checkNotNull(venta, "La venta no puede ser nula");
        return ventaServicio.finalizarVenta(venta);
    }

    // Obtener detalles del carrito
    @GetMapping("/detalles/{idVenta}")
    public List<DetalleVenta> obtenerDetalles(@PathVariable int idVenta) {
        Preconditions.checkArgument(idVenta > 0, "El ID de venta debe ser positivo");
        List<DetalleVenta> detalles = ventaServicio.obtenerDetallesPorVenta(idVenta);
        return ImmutableList.copyOf(detalles); // Retorna una lista inmutable
    }

    // Vaciar carrito (eliminar todos los productos del carrito)
    @DeleteMapping("/{idVenta}/vaciar")
    public ResponseEntity<?> vaciarCarrito(@PathVariable int idVenta) {
        ventaServicio.vaciarCarrito(idVenta);
        return ResponseEntity.ok().build();
    }
} 