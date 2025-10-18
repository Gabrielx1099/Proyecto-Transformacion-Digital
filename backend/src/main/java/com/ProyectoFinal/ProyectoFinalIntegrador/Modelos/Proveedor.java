package com.ProyectoFinal.ProyectoFinalIntegrador.Modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "Proveedores")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_proveedor;

    private String nombre_proveedor;
    private String nombre_empresa;
    private String telefono;
    private String ruc;

    // Constructores
    public Proveedor() {}

    public Proveedor(String nombre_proveedor, String nombre_empresa, String telefono, String ruc) {
        this.nombre_proveedor = nombre_proveedor;
        this.nombre_empresa = nombre_empresa;
        this.telefono = telefono;
        this.ruc = ruc;
    }

    // Getters y Setters
    public int getId_proveedor() {
        return id_proveedor;
    }

    public void setId_proveedor(int id_proveedor) {
        this.id_proveedor = id_proveedor;
    }

    public String getNombre_proveedor() {
        return nombre_proveedor;
    }

    public void setNombre_proveedor(String nombre_proveedor) {
        this.nombre_proveedor = nombre_proveedor;
    }

    public String getNombre_empresa() {
        return nombre_empresa;
    }

    public void setNombre_empresa(String nombre_empresa) {
        this.nombre_empresa = nombre_empresa;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }
}