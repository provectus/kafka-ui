package com.provectus.kafka.ui.config;

import java.util.Collections;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.reactive.WebFluxProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ContextPathCompositeHandler;
import org.springframework.http.server.reactive.HttpHandler;
import org.springframework.jmx.export.MBeanExporter;
import org.springframework.util.StringUtils;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.adapter.WebHttpHandlerBuilder;

@Configuration
@AllArgsConstructor
public class Config {

  private final ApplicationContext applicationContext;

  private final ServerProperties serverProperties;

  @Bean
  public HttpHandler httpHandler(ObjectProvider<WebFluxProperties> propsProvider) {

    final String basePath = serverProperties.getServlet().getContextPath();

    HttpHandler httpHandler = WebHttpHandlerBuilder
        .applicationContext(this.applicationContext).build();

    if (StringUtils.hasText(basePath)) {
      Map<String, HttpHandler> handlersMap =
          Collections.singletonMap(basePath, httpHandler);
      return new ContextPathCompositeHandler(handlersMap);
    }
    return httpHandler;
  }

  @Bean
  public MBeanExporter exporter() {
    final var exporter = new MBeanExporter();
    exporter.setAutodetect(true);
    exporter.setExcludedBeans("pool");
    return exporter;
  }

  @Bean
  public WebClient webClient(
      @Value("${webclient.max-in-memory-buffer-size:20MB}") DataSize maxBuffSize) {
    return WebClient.builder()
        .codecs(c -> c.defaultCodecs().maxInMemorySize((int) maxBuffSize.toBytes()))
        .build();
  }

  @Bean
  public JsonNullableModule jsonNullableModule() {
    return new JsonNullableModule();
  }
}
