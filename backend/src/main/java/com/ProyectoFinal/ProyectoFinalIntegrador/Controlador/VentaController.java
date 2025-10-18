package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.*;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.*;
import com.ProyectoFinal.ProyectoFinalIntegrador.Servicio.EmailServicio;
import com.ProyectoFinal.ProyectoFinalIntegrador.Servicio.PagoServicio;
import com.ProyectoFinal.ProyectoFinalIntegrador.Servicio.PdfServicio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "http://localhost:3000")
public class VentaController {
    
    private static final Logger logger = LoggerFactory.getLogger(VentaController.class);
    
    @Autowired
    private VentaRepositorio ventaRepositorio;
    
    @Autowired
    private DetalleVentaRepositorio detalleVentaRepositorio;
    
    @Autowired
    private ProductoRespositorio productoRepositorio;
    
    @Autowired
    private AppUserRespositorio appUserRepositorio;
    
    @Autowired
    private EmailServicio emailServicio;
    
    @Autowired
    private PdfServicio pdfServicio;
    
    @Autowired
    private PagoServicio pagoServicio;

    /**
     * Obtener una venta por ID con todos sus detalles
     */
    @GetMapping("/{idVenta}")
    public ResponseEntity<?> obtenerVentaPorId(@PathVariable int idVenta) {
        try {
            Optional<Venta> ventaOpt = ventaRepositorio.findById(idVenta);

            if (ventaOpt.isEmpty()) {
                logger.warn("Venta no encontrada con ID: {}", idVenta);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Venta no encontrada"));
            }
            
            Venta venta = ventaOpt.get();
            
            // Crear respuesta completa con detalles
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("idVenta", venta.getIdVenta());
            respuesta.put("idUsuario", venta.getIdUsuario());
            respuesta.put("total", venta.getTotal());
            respuesta.put("fecha", venta.getFecha());
            respuesta.put("estado", venta.getEstado());
            respuesta.put("tipoComprobante", venta.getTipoComprobante());
            respuesta.put("detalles", venta.getDetalles());
            
            logger.info("Venta obtenida exitosamente - ID: {}", idVenta);
            return ResponseEntity.ok(respuesta);
            
        } catch (Exception e) {
            logger.error("Error al obtener venta por ID {}: {}", idVenta, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno del servidor"));
        }
    }

    /**
     * Obtener todas las ventas de un usuario
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerVentasUsuario(@PathVariable int idUsuario) {
        try {
            List<Venta> ventas = ventaRepositorio.findByIdUsuario(idUsuario);
            logger.info("Obtenidas {} ventas para usuario ID: {}", ventas.size(), idUsuario);
            return ResponseEntity.ok(ventas);

        } catch (Exception e) {
            logger.error("Error al obtener ventas del usuario {}: {}", idUsuario, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al obtener ventas"));
        }
    }

    /**
     * Crear una nueva venta desde el carrito
     */
    @PostMapping("/crear-desde-carrito")
    @Transactional
    public ResponseEntity<?> crearVentaDesdeCarrito(@RequestBody Map<String, Object> request) {
        try {
            int idUsuario = (Integer) request.get("idUsuario");
            List<Map<String, Object>> productosCarrito = (List<Map<String, Object>>) request.get("productos");
            String tipoComprobante = (String) request.getOrDefault("tipoComprobante", "boleta");
            
            // Validar usuario
            Optional<AppUser> usuarioOpt = appUserRepositorio.findById(idUsuario);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Usuario no encontrado"));
            }
            
            // Crear nueva venta
            Venta nuevaVenta = new Venta();
            nuevaVenta.setIdUsuario(idUsuario);
            nuevaVenta.setFecha(LocalDateTime.now());
            nuevaVenta.setEstado("PENDIENTE");
            nuevaVenta.setTipoComprobante(tipoComprobante);
            
            BigDecimal totalVenta = BigDecimal.ZERO;
            List<DetalleVenta> detalles = new ArrayList<>();
            
            // Procesar cada producto del carrito
            for (Map<String, Object> item : productosCarrito) {
                int idProducto = (Integer) item.get("id_producto");
                int cantidad = (Integer) item.get("cantidad");
                
                Optional<Producto> productoOpt = productoRepositorio.findById(idProducto);
                if (productoOpt.isEmpty()) {
                    logger.warn("Producto no encontrado con ID: {}", idProducto);
                    continue;
                }
                
                Producto producto = productoOpt.get();
                
                // Verificar stock disponible
                if (producto.getStock() < cantidad) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Stock insuficiente para el producto: " + producto.getNombre()));
                }
                
                // Crear detalle de venta
                DetalleVenta detalle = new DetalleVenta();
                detalle.setVenta(nuevaVenta);
                detalle.setId_producto(idProducto);
                detalle.setProducto(producto);
                detalle.setCantidad(cantidad);
                detalle.setPrecioUnitario(producto.getPrecio());
                
                BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(cantidad));
                detalle.setSubtotal(subtotal);

                detalles.add(detalle);
                totalVenta = totalVenta.add(subtotal);
            }
            
            // Calcular impuestos y envío
            BigDecimal impuestos = totalVenta.multiply(BigDecimal.valueOf(0.18));
            BigDecimal envio = totalVenta.compareTo(BigDecimal.valueOf(100)) > 0 ? 
                BigDecimal.ZERO : BigDecimal.valueOf(15.00);

            BigDecimal totalConImpuestos = totalVenta.add(impuestos).add(envio);
            
            nuevaVenta.setSubtotal(totalVenta);
            nuevaVenta.setImpuestos(impuestos);
            nuevaVenta.setEnvio(envio);
            nuevaVenta.setTotal(totalConImpuestos);
            nuevaVenta.setDetalles(detalles);
            
            // Guardar venta
            Venta ventaGuardada = ventaRepositorio.save(nuevaVenta);
            
            // ELIMINAR EL CARRITO ORIGINAL para evitar que persistan los productos
            Venta carritoOriginal = ventaRepositorio.findByIdUsuarioAndTotalIsNullAndEstado(idUsuario, "PENDIENTE");
            if (carritoOriginal != null && carritoOriginal.getIdVenta() != ventaGuardada.getIdVenta()) {
                // Eliminar todos los detalles del carrito original
                detalleVentaRepositorio.deleteByVenta_IdVenta(carritoOriginal.getIdVenta());
                // Eliminar el carrito original
                ventaRepositorio.delete(carritoOriginal);
                logger.info("Carrito original eliminado - ID: {}", carritoOriginal.getIdVenta());
            }
            
            logger.info("Venta creada exitosamente - ID: {}, Total: {}", 
                ventaGuardada.getIdVenta(), totalConImpuestos);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(ventaGuardada);
            
        } catch (Exception e) {
            logger.error("Error al crear venta desde carrito: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al crear venta"));
        }
    }

    /**
     * Procesar el pago de una venta
     */
    @PostMapping("/{idVenta}/procesar-pago")
    public ResponseEntity<?> procesarPago(
            @PathVariable int idVenta,
            @RequestBody Map<String, Object> datosPago) {

        try {
            Optional<Venta> ventaOpt = ventaRepositorio.findById(idVenta);
            if (ventaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Venta no encontrada"));
            }
            
            Venta venta = ventaOpt.get();

            if (!"PENDIENTE".equals(venta.getEstado())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "La venta ya ha sido procesada"));
            }
            
            // Obtener datos del pago
            String metodoPago = (String) datosPago.get("metodoPago");
            Map<String, Object> datosCliente = (Map<String, Object>) datosPago.get("datosCliente");
            Map<String, Object> datosEnvio = (Map<String, Object>) datosPago.get("datosEnvio");
            
            // Procesar pago según el método
            Map<String, Object> resultadoPago = pagoServicio.procesarPago(
                metodoPago, 
                venta.getTotal(), 
                datosPago
            );
            
            boolean pagoExitoso = (Boolean) resultadoPago.get("exitoso");
            
            if (pagoExitoso) {
                venta.setEstado("PAGADA");
                venta.setTotal(venta.getTotal());
                venta.setMetodoPago(metodoPago);
                venta.setFechaPago(LocalDateTime.now());
                
                // Actualizar datos del cliente y envío
                actualizarDatosVenta(venta, datosCliente, datosEnvio);
                
                // Reducir stock de productos
                for (DetalleVenta detalle : venta.getDetalles()) {
                    Producto producto = detalle.getProducto();
                    producto.setStock(producto.getStock() - detalle.getCantidad());
                    productoRepositorio.save(producto);
                }
                
                // Guardar venta actualizada
                Venta ventaActualizada = ventaRepositorio.save(venta);
                
                // LIMPIEZA ADICIONAL: Eliminar cualquier carrito pendiente que pueda haber quedado
                Venta carritoPendiente = ventaRepositorio.findByIdUsuarioAndTotalIsNullAndEstado(venta.getIdUsuario(), "PENDIENTE");
                if (carritoPendiente != null && carritoPendiente.getIdVenta() != ventaActualizada.getIdVenta()) {
                    detalleVentaRepositorio.deleteByVenta_IdVenta(carritoPendiente.getIdVenta());
                    ventaRepositorio.delete(carritoPendiente);
                    logger.info("Carrito pendiente eliminado tras pago - ID: {}", carritoPendiente.getIdVenta());
                }
                
                // Generar y enviar comprobante por email
                try {
                    byte[] pdfComprobante = pdfServicio.generarComprobante(ventaActualizada);
                    emailServicio.enviarComprobante(
                        venta.getEmailCliente(),
                        venta.getTipoComprobante(),
                        pdfComprobante,
                        ventaActualizada
                    );
                } catch (Exception e) {
                    logger.error("Error al enviar comprobante por email: {}", e.getMessage());
                    // No fallar todo el proceso si no se puede enviar email
                }
                
                logger.info("Pago procesado exitosamente - Venta ID: {}", idVenta);
                
                Map<String, Object> respuesta = new HashMap<>();
                respuesta.put("exitoso", true);
                respuesta.put("mensaje", "Pago procesado exitosamente");
                respuesta.put("venta", ventaActualizada);
                respuesta.put("transaccionId", resultadoPago.get("transaccionId"));
                
                return ResponseEntity.ok(respuesta);
                
            } else {
                // Pago falló
                venta.setEstado("PAGO_FALLIDO");
                ventaRepositorio.save(venta);
                
                return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(Map.of(
                        "exitoso", false,
                        "error", resultadoPago.get("error"),
                        "mensaje", "El pago no pudo ser procesado"
                    ));
            }
            
        } catch (Exception e) {
            logger.error("Error al procesar pago para venta {}: {}", idVenta, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno al procesar pago"));
        }
    }

    /**
     * Cancelar una venta
     */
    @PostMapping("/{idVenta}/cancelar")
    public ResponseEntity<?> cancelarVenta(@PathVariable int idVenta) {
        try {
            Optional<Venta> ventaOpt = ventaRepositorio.findById(idVenta);
            if (ventaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Venta no encontrada"));
            }
            
            Venta venta = ventaOpt.get();

            if ("PAGADA".equals(venta.getEstado())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No se puede cancelar una venta ya pagada"));
            }
            
            venta.setEstado("CANCELADA");
            venta.setFechaCancelacion(LocalDateTime.now());

            ventaRepositorio.save(venta);
            
            logger.info("Venta cancelada - ID: {}", idVenta);
            return ResponseEntity.ok(Map.of("mensaje", "Venta cancelada exitosamente"));
            
        } catch (Exception e) {
            logger.error("Error al cancelar venta {}: {}", idVenta, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al cancelar venta"));
        }
    }

    /**
     * Obtener estadísticas de ventas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            Map<String, Object> estadisticas = new HashMap<>();
            
            // Total de ventas
            long totalVentas = ventaRepositorio.count();
            estadisticas.put("totalVentas", totalVentas);
            
            // Ventas por estado
            Map<String, Long> ventasPorEstado = new HashMap<>();
            List<Venta> todasVentas = ventaRepositorio.findAll();
            
            long pendientes = todasVentas.stream().filter(v -> "PENDIENTE".equals(v.getEstado())).count();
            long pagadas = todasVentas.stream().filter(v -> "PAGADA".equals(v.getEstado())).count();
            long canceladas = todasVentas.stream().filter(v -> "CANCELADA".equals(v.getEstado())).count();
            
            ventasPorEstado.put("PENDIENTE", pendientes);
            ventasPorEstado.put("PAGADA", pagadas);
            ventasPorEstado.put("CANCELADA", canceladas);
            estadisticas.put("ventasPorEstado", ventasPorEstado);
            
            // Total recaudado
            BigDecimal totalRecaudado = todasVentas.stream()
                .filter(v -> "PAGADA".equals(v.getEstado()))
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            estadisticas.put("totalRecaudado", totalRecaudado);
            
            return ResponseEntity.ok(estadisticas);
            
        } catch (Exception e) {
            logger.error("Error al obtener estadísticas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al obtener estadísticas"));
        }
    }

    /**
     * Método privado para actualizar datos de la venta
     */
    private void actualizarDatosVenta(Venta venta, Map<String, Object> datosCliente, Map<String, Object> datosEnvio) {
        // Datos del cliente
        venta.setNombreCliente((String) datosCliente.get("nombre") + " " + (String) datosCliente.get("apellidos"));
        venta.setEmailCliente((String) datosCliente.get("email"));
        venta.setTelefonoCliente((String) datosCliente.get("telefono"));
        venta.setDocumentoCliente((String) datosCliente.get("documento"));
        venta.setTipoDocumento((String) datosCliente.get("tipoDocumento"));
        
        // Datos para factura si aplica
        if ("factura".equals(venta.getTipoComprobante())) {
            venta.setRazonSocial((String) datosCliente.get("razonSocial"));
            venta.setRuc((String) datosCliente.get("ruc"));
            venta.setDireccionFiscal((String) datosCliente.get("direccionFiscal"));
        }
        
        // Datos de envío
        venta.setDireccionEnvio((String) datosEnvio.get("direccion"));
        venta.setDistritoEnvio((String) datosEnvio.get("distrito"));
        venta.setProvinciaEnvio((String) datosEnvio.get("provincia"));
        venta.setDepartamentoEnvio((String) datosEnvio.get("departamento"));
        venta.setReferenciaEnvio((String) datosEnvio.get("referencia"));
        venta.setCodigoPostal((String) datosEnvio.get("codigoPostal"));
    }
}