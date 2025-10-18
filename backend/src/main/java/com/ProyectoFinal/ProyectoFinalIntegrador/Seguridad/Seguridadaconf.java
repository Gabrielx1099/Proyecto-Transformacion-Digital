package com.ProyectoFinal.ProyectoFinalIntegrador.Seguridad;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class Seguridadaconf {

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;
@Bean
public DefaultSecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .cors()
        .and()
        .csrf().disable() // <--- Deshabilita CSRF para APIs REST
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/", "/catalogo", "/api/auth/login", "/api/auth/registrar", "/logout",
                             "/css/**", "/js/**", "/images/**").permitAll()
            .requestMatchers("/admin/**").hasRole("admin")
            .requestMatchers("/cliente/**").hasRole("cliente")
            .requestMatchers("/intranet").authenticated()
            .anyRequest().permitAll()
        )
        .build();
}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://localhost:3002");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
