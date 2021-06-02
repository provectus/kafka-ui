package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.BrokersApi;
import com.provectus.kafka.ui.model.Broker;
import com.provectus.kafka.ui.model.BrokerMetrics;
import com.provectus.kafka.ui.service.ClusterService;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Log4j2
public class StaticController {
  private final ServerProperties serverProperties;

  @Value("classpath:static/index.html")
  private Resource indexFile;

  @RequestMapping(value = "/index.html",
        produces = { "text/html" }, 
        method = RequestMethod.GET)
  public Mono<ResponseEntity<String>> getIndex(ServerWebExchange exchange) throws IOException {

    String contextPath = serverProperties.getServlet().getContextPath() != null 
        ? serverProperties.getServlet().getContextPath() : "";

    String data = asString(indexFile)
        .replace("./static", contextPath + "/static")
        .replace("window.basePath=\"/\"", "window.basePath=\"" + contextPath + "\"");

    return Mono.just(ResponseEntity.ok(data));
  }

  public static String asString(Resource resource) throws IOException {
    try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
      return FileCopyUtils.copyToString(reader);
    }
  }

}
