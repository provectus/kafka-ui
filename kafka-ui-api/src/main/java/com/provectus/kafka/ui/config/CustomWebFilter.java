package com.provectus.kafka.ui.config;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class CustomWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

    final String basePath = exchange.getRequest().getPath().contextPath().value();

    final String path = exchange.getRequest().getPath().pathWithinApplication().value();

    if (path.startsWith("/ui") || path.equals("") || path.equals("/")) {
      return chain.filter(
          exchange.mutate().request(
              exchange.getRequest().mutate()
                  .path(basePath + "/index.html")
                  .contextPath(basePath)
                  .build()
          ).build()
      );
    }

    return chain.filter(exchange);
  }
}