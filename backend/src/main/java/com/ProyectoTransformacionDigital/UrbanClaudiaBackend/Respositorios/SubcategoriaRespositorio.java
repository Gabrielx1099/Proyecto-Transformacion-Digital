package com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Respositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ProyectoTransformacionDigital.UrbanClaudiaBackend.Modelos.Subcategoria;

import java.util.List;

@Repository
public interface SubcategoriaRespositorio extends JpaRepository<Subcategoria, Integer> {

    @Query("SELECT s FROM Subcategoria s WHERE s.id_categoria = :idCategoria")
    List<Subcategoria> findByIdCategoria(@Param("idCategoria") int idCategoria);

}
