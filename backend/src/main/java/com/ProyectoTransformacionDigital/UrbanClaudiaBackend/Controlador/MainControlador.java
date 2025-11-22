package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.Venta;
import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Servicio.VentaServicio;

@Controller
public class MainControlador {

    @GetMapping({"", "/"})
    public String Inicio() {
        return "inicio";
    }

    @GetMapping("/nosotros")
    public String nosotros() {
        return "nosotros";
    }

    @GetMapping("/catalogo")
    public String catalogo() {
        return "catalogo";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/intranet")
    public String intranet() {
        return "intranet";
    }

    @GetMapping("/inicioCliente")
    public String inicioCliente() {
        return "inicioCliente";
    }

    @GetMapping("/higiene")
    public String higiene() {
        return "higiene";
    }

    @GetMapping("/pañaleria")
    public String pañaleria() {
        return "pañaleria";
    }

@Autowired
private VentaServicio ventaServicio;

@GetMapping("/venta/{idVenta}")
public @ResponseBody Venta obtenerVenta(@PathVariable int idVenta) {
    return (Venta) ventaServicio.obtenerDetallesPorVenta(idVenta);
}
}