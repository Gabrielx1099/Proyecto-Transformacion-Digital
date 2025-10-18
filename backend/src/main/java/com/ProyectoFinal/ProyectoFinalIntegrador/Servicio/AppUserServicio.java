package com.ProyectoFinal.ProyectoFinalIntegrador.Servicio;

import com.ProyectoFinal.ProyectoFinalIntegrador.Modelos.AppUser;
import com.ProyectoFinal.ProyectoFinalIntegrador.Respositorios.AppUserRespositorio;
import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
public class AppUserServicio implements UserDetailsService {
    @Autowired
    private AppUserRespositorio repo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Preconditions.checkArgument(!Strings.isNullOrEmpty(email), "El email no puede estar vacío");
        
        AppUser appUser = repo.findByEmail(email);
        if (appUser != null) {
            Set<String> roles = ImmutableSet.of(appUser.getRol());
            return User.withUsername(appUser.getEmail())
                    .password(appUser.getContraseña())
                    .roles(appUser.getRol())
                    .build();
        }
        throw new UsernameNotFoundException("Usuario no encontrado con email: " + email);
    }
}
