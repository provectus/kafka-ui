package com.provectus.kafka.ui.config;

import lombok.AllArgsConstructor;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

@Configuration
@Profile("local")
@AllArgsConstructor
public class CorsGlobalConfiguration implements WebFluxConfigurer {

  private final ServerProperties serverProperties;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("*")
        .allowedMethods("*")
        .allowedHeaders("*")
        .allowCredentials(false);
  }

  private String withContext(String pattern) {
    final String basePath = serverProperties.getServlet().getContextPath();
    if (StringUtils.hasText(basePath)) {
      return basePath + pattern;
    } else {
      return pattern;
    }
  }

  @Bean
  public RouterFunction<ServerResponse> cssFilesRouter() {
    return RouterFunctions
        .resources(withContext("/static/css/**"), new ClassPathResource("static/static/css/"));
  }

  @Bean
  public RouterFunction<ServerResponse> jsFilesRouter() {
    return RouterFunctions
        .resources(withContext("/static/js/**"), new ClassPathResource("static/static/js/"));
  }

  @Bean
  public RouterFunction<ServerResponse> mediaFilesRouter() {
    return RouterFunctions
        .resources(withContext("/static/media/**"), new ClassPathResource("static/static/media/"));
  }
}