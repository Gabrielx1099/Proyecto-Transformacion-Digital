package com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.Subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcategoriaRespositorio extends JpaRepository<Subcategoria, Integer> {

    @Query("SELECT s FROM Subcategoria s WHERE s.id_categoria = :idCategoria")
    List<Subcategoria> findByIdCategoria(@Param("idCategoria") int idCategoria);

}
