package com.ProyectoFinal.ProyectoFinalIntegrador.Modelos;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Ventas")
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private int idVenta;

    @Column(name = "id_usuario")
    private int idUsuario;

    // Campos de montos
    private BigDecimal subtotal;
    private BigDecimal impuestos;
    private BigDecimal envio;
    private BigDecimal total;

    // Fechas
    private LocalDateTime fecha;
    
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    
    @Column(name = "fecha_cancelacion")
    private LocalDateTime fechaCancelacion;

    // Estado y tipo
    private String estado; // PENDIENTE, PAGADA, CANCELADA, PAGO_FALLIDO
    
    @Column(name = "tipo_comprobante")
    private String tipoComprobante; // boleta, factura

    // Datos del cliente
    @Column(name = "nombre_cliente")
    private String nombreCliente;
    
    @Column(name = "email_cliente")
    private String emailCliente;
    
    @Column(name = "telefono_cliente")
    private String telefonoCliente;
    
    @Column(name = "documento_cliente")
    private String documentoCliente;
    
    @Column(name = "tipo_documento")
    private String tipoDocumento; // DNI, CE

    // Datos para factura
    @Column(name = "razon_social")
    private String razonSocial;
    
    private String ruc;
    
    @Column(name = "direccion_fiscal")
    private String direccionFiscal;

    // Datos de envío
    @Column(name = "direccion_envio")
    private String direccionEnvio;
    
    @Column(name = "distrito_envio")
    private String distritoEnvio;
    
    @Column(name = "provincia_envio")
    private String provinciaEnvio;
    
    @Column(name = "departamento_envio")
    private String departamentoEnvio;
    
    @Column(name = "referencia_envio")
    private String referenciaEnvio;
    
    @Column(name = "codigo_postal")
    private String codigoPostal;

    // Datos de pago
    @Column(name = "metodo_pago")
    private String metodoPago; // tarjeta, yape, plin
    
    @Column(name = "transaccion_id")
    private String transaccionId;

    // Relación con DetalleVenta
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DetalleVenta> detalles;

    // Constructor por defecto
    public Venta() {
        this.fecha = LocalDateTime.now();
        this.estado = "PENDIENTE";
    }

    // Getters y Setters
    public int getIdVenta() {
        return idVenta;
    }

    public void setIdVenta(int idVenta) {
        this.idVenta = idVenta;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getImpuestos() {
        return impuestos;
    }

    public void setImpuestos(BigDecimal impuestos) {
        this.impuestos = impuestos;
    }

    public BigDecimal getEnvio() {
        return envio;
    }

    public void setEnvio(BigDecimal envio) {
        this.envio = envio;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public LocalDateTime getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }

    public LocalDateTime getFechaCancelacion() {
        return fechaCancelacion;
    }

    public void setFechaCancelacion(LocalDateTime fechaCancelacion) {
        this.fechaCancelacion = fechaCancelacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getTipoComprobante() {
        return tipoComprobante;
    }

    public void setTipoComprobante(String tipoComprobante) {
        this.tipoComprobante = tipoComprobante;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public String getTelefonoCliente() {
        return telefonoCliente;
    }

    public void setTelefonoCliente(String telefonoCliente) {
        this.telefonoCliente = telefonoCliente;
    }

    public String getDocumentoCliente() {
        return documentoCliente;
    }

    public void setDocumentoCliente(String documentoCliente) {
        this.documentoCliente = documentoCliente;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getDireccionFiscal() {
        return direccionFiscal;
    }

    public void setDireccionFiscal(String direccionFiscal) {
        this.direccionFiscal = direccionFiscal;
    }

    public String getDireccionEnvio() {
        return direccionEnvio;
    }

    public void setDireccionEnvio(String direccionEnvio) {
        this.direccionEnvio = direccionEnvio;
    }

    public String getDistritoEnvio() {
        return distritoEnvio;
    }

    public void setDistritoEnvio(String distritoEnvio) {
        this.distritoEnvio = distritoEnvio;
    }

    public String getProvinciaEnvio() {
        return provinciaEnvio;
    }

    public void setProvinciaEnvio(String provinciaEnvio) {
        this.provinciaEnvio = provinciaEnvio;
    }

    public String getDepartamentoEnvio() {
        return departamentoEnvio;
    }

    public void setDepartamentoEnvio(String departamentoEnvio) {
        this.departamentoEnvio = departamentoEnvio;
    }

    public String getReferenciaEnvio() {
        return referenciaEnvio;
    }

    public void setReferenciaEnvio(String referenciaEnvio) {
        this.referenciaEnvio = referenciaEnvio;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getTransaccionId() {
        return transaccionId;
    }

    public void setTransaccionId(String transaccionId) {
        this.transaccionId = transaccionId;
    }

    public List<DetalleVenta> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVenta> detalles) {
        this.detalles = detalles;
    }
}