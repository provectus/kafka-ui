package com.provectus.kafka.ui.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.resource.WebJarsResourceResolver;

import static org.springdoc.core.Constants.CLASSPATH_RESOURCE_LOCATION;

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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATION+"/webjars/")
                .resourceChain(true)
                .addResolver(new WebJarsResourceResolver());
    }
}