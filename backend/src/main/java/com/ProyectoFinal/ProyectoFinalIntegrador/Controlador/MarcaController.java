package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Marca;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.MarcaRespositorio;
import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/marcas")
@CrossOrigin(origins = "http://localhost:3000")
public class MarcaController {

    @Autowired
    private MarcaRespositorio marcaRepositorio;

    // Obtener todas las marcas
    @GetMapping
    public ResponseEntity<List<Marca>> obtenerTodasLasMarcas() {
        try {
            List<Marca> marcas = marcaRepositorio.findAll();
            // Crear una lista inmutable para evitar modificaciones accidentales
            List<Marca> marcasInmutables = ImmutableList.copyOf(marcas);
            return new ResponseEntity<>(marcasInmutables, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ImmutableList.of(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener marca por ID
    @GetMapping("/{id}")
    public ResponseEntity<Marca> obtenerMarcaPorId(@PathVariable("id") int id) {
        // Validar que el ID sea válido usando Preconditions
        Preconditions.checkArgument(id > 0, "El ID debe ser mayor a 0");
        
        Optional<Marca> marcaData = marcaRepositorio.findById(id);

        if (marcaData.isPresent()) {
            return new ResponseEntity<>(marcaData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Crear nueva marca
    @PostMapping
    public ResponseEntity<Marca> crearMarca(@RequestBody Marca marca) {
        try {
            // Validaciones usando Preconditions y Strings de Guava
            Preconditions.checkNotNull(marca, "La marca no puede ser nula");
            Preconditions.checkArgument(!Strings.isNullOrEmpty(marca.getNombre()), 
                "El nombre de la marca no puede estar vacío");
            
            // Usar Strings.emptyToNull() para normalizar strings vacíos
            String nombreNormalizado = Strings.emptyToNull(marca.getNombre().trim());
            Preconditions.checkNotNull(nombreNormalizado, "El nombre no puede estar vacío después de normalizar");
            
            Marca nuevaMarca = new Marca();
            nuevaMarca.setNombre(nombreNormalizado);
            return new ResponseEntity<>(marcaRepositorio.save(nuevaMarca), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Retornar BAD_REQUEST para errores de validación
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar marca
    @PutMapping("/{id}")
    public ResponseEntity<Marca> actualizarMarca(@PathVariable("id") int id, @RequestBody Marca marca) {
        try {
            // Validaciones usando Preconditions
            Preconditions.checkArgument(id > 0, "El ID debe ser mayor a 0");
            Preconditions.checkNotNull(marca, "La marca no puede ser nula");
            Preconditions.checkArgument(!Strings.isNullOrEmpty(marca.getNombre()), 
                "El nombre de la marca no puede estar vacío");
            
            Optional<Marca> marcaData = marcaRepositorio.findById(id);

            if (marcaData.isPresent()) {
                Marca marcaActualizada = marcaData.get();
                
                // Normalizar el nombre usando Strings de Guava
                String nombreNormalizado = Strings.emptyToNull(marca.getNombre().trim());
                Preconditions.checkNotNull(nombreNormalizado, "El nombre no puede estar vacío después de normalizar");
                
                marcaActualizada.setNombre(nombreNormalizado);
                return new ResponseEntity<>(marcaRepositorio.save(marcaActualizada), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar marca
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> eliminarMarca(@PathVariable("id") int id) {
        try {
            // Validar que el ID sea válido
            Preconditions.checkArgument(id > 0, "El ID debe ser mayor a 0");
            
            marcaRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}