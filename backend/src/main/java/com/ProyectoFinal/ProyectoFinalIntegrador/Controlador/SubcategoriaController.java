package com.ProyectoFinal.ProyectoFinalIntegrador.Controlador;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Subcategoria;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.SubcategoriaRespositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// Importaciones de Google Guava
import com.google.common.base.Strings;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/subcategorias")
@CrossOrigin(origins = "http://localhost:3000")
public class SubcategoriaController {

    @Autowired
    private SubcategoriaRespositorio subcategoriaRepositorio;

    // Cache para mejorar performance (interno, no expuesto via API)
    private final Cache<String, List<Subcategoria>> subcategoriasCache = CacheBuilder.newBuilder()
            .maximumSize(50)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .build();

    private final Cache<Integer, Optional<Subcategoria>> subcategoriaCache = CacheBuilder.newBuilder()
            .maximumSize(200)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .build();

    // Obtener todas las subcategorías
    @GetMapping
    public ResponseEntity<List<Subcategoria>> obtenerTodasLasSubcategorias() {
        try {
            // Validar repositorio usando Preconditions
            Preconditions.checkNotNull(subcategoriaRepositorio, "SubcategoriaRepositorio no puede ser null");

            String cacheKey = "todas_subcategorias";
            List<Subcategoria> subcategorias = subcategoriasCache.getIfPresent(cacheKey);
            
            if (subcategorias == null) {
                subcategorias = subcategoriaRepositorio.findAll();
                
                // Filtrar subcategorías con nombres válidos usando Guava
                List<Subcategoria> subcategoriasFiltradas = Lists.newArrayList();
                for (Subcategoria subcategoria : subcategorias) {
                    if (!Strings.isNullOrEmpty(subcategoria.getNombre())) {
                        subcategoriasFiltradas.add(subcategoria);
                    }
                }
                
                subcategorias = ImmutableList.copyOf(subcategoriasFiltradas);
                subcategoriasCache.put(cacheKey, subcategorias);
            }

            return new ResponseEntity<>(subcategorias, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error al obtener subcategorías: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener subcategoría por ID
    @GetMapping("/{id}")
    public ResponseEntity<Subcategoria> obtenerSubcategoriaPorId(@PathVariable("id") int id) {
        try {
            // Validar ID usando Preconditions
            Preconditions.checkArgument(id > 0, "El ID debe ser mayor que 0, pero fue: %s", id);

            Optional<Subcategoria> subcategoriaData = subcategoriaCache.getIfPresent(id);
            
            if (subcategoriaData == null) {
                subcategoriaData = subcategoriaRepositorio.findById(id);
                subcategoriaCache.put(id, subcategoriaData);
            }

            return subcategoriaData
                    .map(subcategoria -> new ResponseEntity<>(subcategoria, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Error al obtener subcategoría por ID: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Crear nueva subcategoría
    @PostMapping
    public ResponseEntity<Subcategoria> crearSubcategoria(@RequestBody Subcategoria subcategoria) {
        try {
            // Validaciones usando Strings de Guava
            if (Strings.isNullOrEmpty(subcategoria.getNombre()) || 
                Strings.nullToEmpty(subcategoria.getNombre()).trim().isEmpty()) {
                return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
            }

            if (subcategoria.getId_categoria() <= 0) {
                return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
            }

            Subcategoria nuevaSubcategoria = new Subcategoria();
            // Usar Strings.nullToEmpty para manejo seguro
            nuevaSubcategoria.setNombre(Strings.nullToEmpty(subcategoria.getNombre()).trim());
            nuevaSubcategoria.setId_categoria(subcategoria.getId_categoria());

            Subcategoria resultado = subcategoriaRepositorio.save(nuevaSubcategoria);
            
            // Limpiar cache después de crear
            invalidarCaches();
            
            return new ResponseEntity<>(resultado, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error al crear subcategoría: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar subcategoría
    @PutMapping("/{id}")
    public ResponseEntity<Subcategoria> actualizarSubcategoria(@PathVariable("id") int id, @RequestBody Subcategoria subcategoria) {
        try {
            Optional<Subcategoria> subcategoriaData = subcategoriaRepositorio.findById(id);

            if (subcategoriaData.isPresent()) {
                Subcategoria subcategoriaExistente = subcategoriaData.get();

                // Usar Strings de Guava para validaciones más robustas
                if (!Strings.isNullOrEmpty(subcategoria.getNombre()) && 
                    !Strings.nullToEmpty(subcategoria.getNombre()).trim().isEmpty()) {
                    subcategoriaExistente.setNombre(Strings.nullToEmpty(subcategoria.getNombre()).trim());
                }

                if (subcategoria.getId_categoria() > 0) {
                    subcategoriaExistente.setId_categoria(subcategoria.getId_categoria());
                }

                Subcategoria actualizada = subcategoriaRepositorio.save(subcategoriaExistente);
                
                // Limpiar cache después de actualizar
                invalidarCaches();
                
                return new ResponseEntity<>(actualizada, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error al actualizar subcategoría: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar subcategoría
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> eliminarSubcategoria(@PathVariable("id") int id) {
        try {
            if (subcategoriaRepositorio.existsById(id)) {
                subcategoriaRepositorio.deleteById(id);
                
                // Limpiar cache después de eliminar
                invalidarCaches();
                
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error al eliminar subcategoría: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Método privado para invalidar caches (no expuesto via API)
    private void invalidarCaches() {
        subcategoriasCache.invalidateAll();
        subcategoriaCache.invalidateAll();
    }
}