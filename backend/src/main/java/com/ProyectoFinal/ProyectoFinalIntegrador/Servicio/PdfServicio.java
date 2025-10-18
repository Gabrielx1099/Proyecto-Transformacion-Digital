package com.ProyectoFinal.ProyectoFinalIntegrador.Servicio;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Venta;
import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.DetalleVenta;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfServicio {
    
    private static final Logger logger = LoggerFactory.getLogger(PdfServicio.class);
    
    // Constantes para el diseño
    private static final float MARGIN = 50;
    private static final float FONT_SIZE_TITLE = 18;
    private static final float FONT_SIZE_HEADER = 14;
    private static final float FONT_SIZE_NORMAL = 12;
    private static final float FONT_SIZE_SMALL = 10;
    private static final float LINE_HEIGHT = 20;
    
    // Fuentes estándar
    private static final PDFont FONT_HELVETICA = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDFont FONT_HELVETICA_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDFont FONT_HELVETICA_OBLIQUE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);
    private static final PDFont FONT_TIMES_ROMAN = new PDType1Font(Standard14Fonts.FontName.TIMES_ROMAN);
    private static final PDFont FONT_TIMES_BOLD = new PDType1Font(Standard14Fonts.FontName.TIMES_BOLD);
    
    /**
     * Genera un comprobante PDF (boleta o factura)
     */
    public byte[] generarComprobante(Venta venta) throws Exception {
        logger.info("Generando comprobante PDF para venta ID: {}", venta.getIdVenta());
        
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                float yPosition = page.getMediaBox().getHeight() - MARGIN;
                
                // Encabezado de la empresa
                yPosition = dibujarEncabezadoEmpresa(contentStream, yPosition);
                
                // Título del comprobante
                yPosition = dibujarTituloComprobante(contentStream, yPosition, venta);
                
                // Información del cliente
                yPosition = dibujarInformacionCliente(contentStream, yPosition, venta);
                
                // Información de la venta
                yPosition = dibujarInformacionVenta(contentStream, yPosition, venta);
                
                // Detalles de productos
                yPosition = dibujarDetallesProductos(contentStream, yPosition, venta);
                
                // Totales
                yPosition = dibujarTotales(contentStream, yPosition, venta);
                
                // Pie de página
                dibujarPiePagina(contentStream, venta);
            }
            
            // Convertir a bytes
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            
            logger.info("Comprobante PDF generado exitosamente para venta ID: {}", venta.getIdVenta());
            return baos.toByteArray();
            
        } catch (Exception e) {
            logger.error("Error al generar comprobante PDF para venta ID {}: {}", venta.getIdVenta(), e.getMessage());
            throw new Exception("Error al generar comprobante PDF", e);
        }
    }
    
    private float dibujarEncabezadoEmpresa(PDPageContentStream contentStream, float yPosition) throws IOException {
        // Logo y datos de la empresa
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_HEADER);
        escribirTexto(contentStream, "PAÑALERÍA CLAUDIA", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        configurarFuente(contentStream, FONT_HELVETICA, FONT_SIZE_SMALL);
        escribirTexto(contentStream, "RUC: 10100173770", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        escribirTexto(contentStream, "Dirección: Av. Principal 123, Lima, Perú", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        escribirTexto(contentStream, "Teléfono: (51+) 953-567-878 | Email: ventas@PañaleriaClaudia.com", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT * 2;
        
        // Línea separadora
        dibujarLinea(contentStream, MARGIN, yPosition, 545, yPosition);
        yPosition -= LINE_HEIGHT;
        
        return yPosition;
    }
    
    private float dibujarTituloComprobante(PDPageContentStream contentStream, float yPosition, Venta venta) throws IOException {
        String tipoComprobante = venta.getTipoComprobante().toUpperCase();
        String numeroComprobante = String.format("%s N° %06d", 
            tipoComprobante.equals("FACTURA") ? "FACTURA ELECTRÓNICA" : "BOLETA ELECTRÓNICA", 
            venta.getIdVenta());
        
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_TITLE);
        escribirTexto(contentStream, numeroComprobante, MARGIN, yPosition);
        yPosition -= LINE_HEIGHT * 2;
        
        return yPosition;
    }
    
    private float dibujarInformacionCliente(PDPageContentStream contentStream, float yPosition, Venta venta) throws IOException {
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_HEADER);
        escribirTexto(contentStream, "DATOS DEL CLIENTE", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        configurarFuente(contentStream, FONT_HELVETICA, FONT_SIZE_NORMAL);
        
        // Nombre del cliente
        String nombreCliente = venta.getNombreCliente() != null ? venta.getNombreCliente() : "Cliente General";
        escribirTexto(contentStream, "Cliente: " + nombreCliente, MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        // Documento
        if (venta.getDocumentoCliente() != null) {
            String tipoDoc = venta.getTipoDocumento() != null ? venta.getTipoDocumento() : "DNI";
            escribirTexto(contentStream, tipoDoc + ": " + venta.getDocumentoCliente(), MARGIN, yPosition);
            yPosition -= LINE_HEIGHT;
        }
        
        // Email
        if (venta.getEmailCliente() != null) {
            escribirTexto(contentStream, "Email: " + venta.getEmailCliente(), MARGIN, yPosition);
            yPosition -= LINE_HEIGHT;
        }
        
        // Datos adicionales para factura
        if ("factura".equalsIgnoreCase(venta.getTipoComprobante()) && venta.getRazonSocial() != null) {
            escribirTexto(contentStream, "Razón Social: " + venta.getRazonSocial(), MARGIN, yPosition);
            yPosition -= LINE_HEIGHT;
            
            if (venta.getRuc() != null) {
                escribirTexto(contentStream, "RUC: " + venta.getRuc(), MARGIN, yPosition);
                yPosition -= LINE_HEIGHT;
            }
        }
        
        yPosition -= LINE_HEIGHT;
        return yPosition;
    }
    
    private float dibujarInformacionVenta(PDPageContentStream contentStream, float yPosition, Venta venta) throws IOException {
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_HEADER);
        escribirTexto(contentStream, "INFORMACIÓN DE LA VENTA", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        configurarFuente(contentStream, FONT_HELVETICA, FONT_SIZE_NORMAL);
        
        // Fecha
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        escribirTexto(contentStream, "Fecha: " + venta.getFecha().format(formatter), MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        // Método de pago
        if (venta.getMetodoPago() != null) {
            escribirTexto(contentStream, "Método de Pago: " + venta.getMetodoPago().toUpperCase(), MARGIN, yPosition);
            yPosition -= LINE_HEIGHT;
        }
        
        // ID de transacción
        if (venta.getTransaccionId() != null) {
            escribirTexto(contentStream, "ID Transacción: " + venta.getTransaccionId(), MARGIN, yPosition);
            yPosition -= LINE_HEIGHT;
        }
        
        // Dirección de envío
        if (venta.getDireccionEnvio() != null) {
            escribirTexto(contentStream, "Dirección de Envío:", MARGIN, yPosition);
            yPosition -= LINE_HEIGHT;
            
            String direccionCompleta = construirDireccionCompleta(venta);
            escribirTexto(contentStream, direccionCompleta, MARGIN + 20, yPosition);
            yPosition -= LINE_HEIGHT;
        }
        
        yPosition -= LINE_HEIGHT;
        return yPosition;
    }
    
    private float dibujarDetallesProductos(PDPageContentStream contentStream, float yPosition, Venta venta) throws IOException {
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_HEADER);
        escribirTexto(contentStream, "DETALLE DE PRODUCTOS", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT * 1.5f;
        
        // Encabezados de tabla
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_SMALL);
        escribirTexto(contentStream, "PRODUCTO", MARGIN, yPosition);
        escribirTexto(contentStream, "CANT.", 300, yPosition);
        escribirTexto(contentStream, "P. UNIT.", 350, yPosition);
        escribirTexto(contentStream, "SUBTOTAL", 450, yPosition);
        yPosition -= LINE_HEIGHT;
        
        // Línea separadora
        dibujarLinea(contentStream, MARGIN, yPosition, 545, yPosition);
        yPosition -= LINE_HEIGHT;
        
        // Detalles de productos
        configurarFuente(contentStream, FONT_HELVETICA, FONT_SIZE_SMALL);
        yPosition = dibujarFilasProductos(contentStream, yPosition, venta.getDetalles());
        
        yPosition -= LINE_HEIGHT;
        return yPosition;
    }
    
    private float dibujarFilasProductos(PDPageContentStream contentStream, float yPosition, List<DetalleVenta> detalles) throws IOException {
        if (detalles != null) {
            for (DetalleVenta detalle : detalles) {
                String nombreProducto = obtenerNombreProducto(detalle);
                BigDecimal precioUnitario = obtenerPrecioUnitario(detalle);
                BigDecimal subtotal = calcularSubtotal(detalle, precioUnitario);
                
                escribirTexto(contentStream, nombreProducto, MARGIN, yPosition);
                escribirTexto(contentStream, String.valueOf(detalle.getCantidad()), 300, yPosition);
                escribirTexto(contentStream, "S/ " + formatearMonto(precioUnitario), 350, yPosition);
                escribirTexto(contentStream, "S/ " + formatearMonto(subtotal), 450, yPosition);
                
                yPosition -= LINE_HEIGHT;
            }
        }
        return yPosition;
    }
    
    private float dibujarTotales(PDPageContentStream contentStream, float yPosition, Venta venta) throws IOException {
        // Línea separadora
        dibujarLinea(contentStream, 350, yPosition, 545, yPosition);
        yPosition -= LINE_HEIGHT;
        
        configurarFuente(contentStream, FONT_HELVETICA, FONT_SIZE_NORMAL);
        
        // Subtotal
        if (venta.getSubtotal() != null) {
            yPosition = escribirLineaTotal(contentStream, "Subtotal:", venta.getSubtotal(), yPosition);
        }
        
        // Envío
        if (venta.getEnvio() != null && venta.getEnvio().compareTo(BigDecimal.ZERO) > 0) {
            yPosition = escribirLineaTotal(contentStream, "Envío:", venta.getEnvio(), yPosition);
        }
        
        // Impuestos
        if (venta.getImpuestos() != null) {
            yPosition = escribirLineaTotal(contentStream, "IGV (18%):", venta.getImpuestos(), yPosition);
        }
        
        // Total
        configurarFuente(contentStream, FONT_HELVETICA_BOLD, FONT_SIZE_HEADER);
        escribirTexto(contentStream, "TOTAL:", 350, yPosition);
        escribirTexto(contentStream, "S/ " + formatearMonto(venta.getTotal()), 450, yPosition);
        
        return yPosition;
    }
    
    private void dibujarPiePagina(PDPageContentStream contentStream, Venta venta) throws IOException {
        float yPosition = 100;
        
        configurarFuente(contentStream, FONT_HELVETICA, FONT_SIZE_SMALL);
        escribirTexto(contentStream, "Gracias por su compra. Para consultas o reclamos, contáctenos:", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        escribirTexto(contentStream, "Email: soporte@pañaleriaclaudia.com | Teléfono: (51+) 953-567-878", MARGIN, yPosition);
        yPosition -= LINE_HEIGHT;
        
        String fechaGeneracion = "Documento generado el: " + 
            java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        escribirTexto(contentStream, fechaGeneracion, MARGIN, yPosition);
    }
    
    // Métodos auxiliares para mejorar la legibilidad y reutilización
    
    private void configurarFuente(PDPageContentStream contentStream, PDFont fuente, float tamaño) throws IOException {
        contentStream.setFont(fuente, tamaño);
    }
    
    private void escribirTexto(PDPageContentStream contentStream, String texto, float x, float y) throws IOException {
        contentStream.beginText();
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(texto);
        contentStream.endText();
    }
    
    private void dibujarLinea(PDPageContentStream contentStream, float x1, float y1, float x2, float y2) throws IOException {
        contentStream.moveTo(x1, y1);
        contentStream.lineTo(x2, y2);
        contentStream.stroke();
    }
    
    private float escribirLineaTotal(PDPageContentStream contentStream, String etiqueta, BigDecimal monto, float yPosition) throws IOException {
        escribirTexto(contentStream, etiqueta, 350, yPosition);
        escribirTexto(contentStream, "S/ " + formatearMonto(monto), 450, yPosition);
        return yPosition - LINE_HEIGHT;
    }
    
    private String construirDireccionCompleta(Venta venta) {
        StringBuilder direccion = new StringBuilder(venta.getDireccionEnvio());
        
        if (venta.getDistritoEnvio() != null) {
            direccion.append(", ").append(venta.getDistritoEnvio());
        }
        if (venta.getProvinciaEnvio() != null) {
            direccion.append(", ").append(venta.getProvinciaEnvio());
        }
        if (venta.getDepartamentoEnvio() != null) {
            direccion.append(", ").append(venta.getDepartamentoEnvio());
        }
        
        return direccion.toString();
    }
    
    private String obtenerNombreProducto(DetalleVenta detalle) {
        String nombre = detalle.getProducto() != null ? 
            detalle.getProducto().getNombre() : "Producto ID: " + detalle.getId_producto();
        
        // Limitar nombre del producto para que no exceda el ancho de la columna
        return nombre.length() > 30 ? nombre.substring(0, 27) + "..." : nombre;
    }
    
    private BigDecimal obtenerPrecioUnitario(DetalleVenta detalle) {
        return detalle.getPrecioUnitario() != null ? detalle.getPrecioUnitario() : BigDecimal.ZERO;
    }
    
    private BigDecimal calcularSubtotal(DetalleVenta detalle, BigDecimal precioUnitario) {
        return detalle.getSubtotal() != null ? 
            detalle.getSubtotal() : precioUnitario.multiply(BigDecimal.valueOf(detalle.getCantidad()));
    }
    
    private String formatearMonto(BigDecimal monto) {
        return monto != null ? monto.toString() : "0.00";
    }
}