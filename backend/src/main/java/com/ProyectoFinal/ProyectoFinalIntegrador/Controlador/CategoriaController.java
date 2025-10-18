package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Categoria;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.CategoriaRespositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoriaController {

    @Autowired
    private CategoriaRespositorio categoriaRepositorio;

    // Obtener todas las categorías
    @GetMapping
    public ResponseEntity<List<Categoria>> obtenerTodasLasCategorias() {
        try {
            List<Categoria> categorias = categoriaRepositorio.findAll();
            return new ResponseEntity<>(categorias, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener categoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtenerCategoriaPorId(@PathVariable("id") int id) {
        Optional<Categoria> categoriaData = categoriaRepositorio.findById(id);

        if (categoriaData.isPresent()) {
            return new ResponseEntity<>(categoriaData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Crear nueva categoría
        @PostMapping
        public ResponseEntity<Categoria> crearCategoria(@RequestBody Categoria categoria) {
            try {
                Categoria nuevaCategoria = new Categoria();
                nuevaCategoria.setNombre(categoria.getNombre());
                return new ResponseEntity<>(categoriaRepositorio.save(nuevaCategoria), HttpStatus.CREATED);
            } catch (Exception e) {
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }
}

    // Actualizar categoría
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(@PathVariable("id") int id, @RequestBody Categoria categoria) {
        Optional<Categoria> categoriaData = categoriaRepositorio.findById(id);

        if (categoriaData.isPresent()) {
            Categoria categoriaActualizada = categoriaData.get();
            categoriaActualizada.setNombre(categoria.getNombre());
            return new ResponseEntity<>(categoriaRepositorio.save(categoriaActualizada), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Eliminar categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> eliminarCategoria(@PathVariable("id") int id) {
        try {
            categoriaRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}