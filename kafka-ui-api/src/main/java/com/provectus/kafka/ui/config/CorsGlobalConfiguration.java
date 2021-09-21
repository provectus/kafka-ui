package com.provectus.kafka.ui.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

@Configuration
@EnableWebFlux
@Profile("local")
public class CorsGlobalConfiguration implements WebFluxConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("*")
        .allowedMethods("*")
        .allowedHeaders("*")
        .allowCredentials(true);
  }

  @Bean
  public RouterFunction<ServerResponse> cssFilesRouter() {
    return RouterFunctions
        .resources("/static/css/**", new ClassPathResource("static/static/css/"));
  }

  @Bean
  public RouterFunction<ServerResponse> jsFilesRouter() {
    return RouterFunctions
        .resources("/static/js/**", new ClassPathResource("static/static/js/"));
  }

  @Bean
  public RouterFunction<ServerResponse> mediaFilesRouter() {
    return RouterFunctions
        .resources("/static/media/**", new ClassPathResource("static/static/media/"));
  }
}