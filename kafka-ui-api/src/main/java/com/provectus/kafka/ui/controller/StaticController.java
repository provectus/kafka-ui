package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.util.ResourceUtil;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class StaticController {

  @Value("classpath:static/index.html")
  private Resource indexFile;
  private final AtomicReference<String> renderedIndexFile = new AtomicReference<>();

  @GetMapping(value = "/index.html", produces = {"text/html"})
  public Mono<ResponseEntity<String>> getIndex(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(getRenderedIndexFile(exchange)));
  }

  public String getRenderedIndexFile(ServerWebExchange exchange) {
    String rendered = renderedIndexFile.get();
    if (rendered == null) {
      rendered = buildIndexFile(exchange.getRequest().getPath().contextPath().value());
      if (renderedIndexFile.compareAndSet(null, rendered)) {
        return rendered;
      } else {
        return renderedIndexFile.get();
      }
    } else {
      return rendered;
    }
  }

  @SneakyThrows
  private String buildIndexFile(String contextPath) {
    final String staticPath = contextPath + "/static";
    return ResourceUtil.readAsString(indexFile)
        .replace("href=\"./static", "href=\"" + staticPath)
        .replace("src=\"./static", "src=\"" + staticPath)
        .replace("window.basePath=\"\"", "window.basePath=\"" + contextPath + "\"");
  }
}
