package com.ProyectoFinal.ProyectoFinalIntegrador.Modelos;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "DetalleVenta")
public class DetalleVenta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_detalle;
    
    @ManyToOne
    @JoinColumn(name = "id_venta")
    @JsonIgnore
    private Venta venta;
    
    @Column(name = "id_producto")
    private int id_producto;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", insertable = false, updatable = false)
    private Producto producto;
    
    private int cantidad;
    
    // Nuevos campos para mejorar el detalle de venta
    @Column(name = "precio_unitario", precision = 10, scale = 2)
    private BigDecimal precioUnitario;
    
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(name = "descuento", precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;
    
    // Constructor por defecto
    public DetalleVenta() {}
    
    // Constructor con parámetros
    public DetalleVenta(Venta venta, int id_producto, Producto producto, 
                       int cantidad, BigDecimal precioUnitario) {
        this.venta = venta;
        this.id_producto = id_producto;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
    
    // Método para calcular subtotal automáticamente
    public void calcularSubtotal() {
        if (precioUnitario != null && cantidad > 0) {
            BigDecimal subtotalBruto = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
            this.subtotal = subtotalBruto.subtract(descuento != null ? descuento : BigDecimal.ZERO);
        }
    }
    
    // Getters y Setters
    public int getId_detalle() {
        return id_detalle;
    }
    
    public void setId_detalle(int id_detalle) {
        this.id_detalle = id_detalle;
    }
    
    public Venta getVenta() {
        return venta;
    }
    
    public void setVenta(Venta venta) {
        this.venta = venta;
    }
    
    public int getId_producto() {
        return id_producto;
    }
    
    public void setId_producto(int id_producto) {
        this.id_producto = id_producto;
    }
    
    public Producto getProducto() {
        return producto;
    }
    
    public void setProducto(Producto producto) {
        this.producto = producto;
    }
    
    public int getCantidad() {
        return cantidad;
    }
    
    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
        calcularSubtotal(); // Recalcular cuando cambie la cantidad
    }
    
    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }
    
    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
        calcularSubtotal(); // Recalcular cuando cambie el precio
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public BigDecimal getDescuento() {
        return descuento;
    }
    
    public void setDescuento(BigDecimal descuento) {
        this.descuento = descuento;
        calcularSubtotal(); // Recalcular cuando cambie el descuento
    }
}