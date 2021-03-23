package com.provectus.kafka.ui.exception;

import java.util.Map;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.server.ServerRequest;

@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

  public static final String STATUS = "status";

  @Override
  public Map<String, Object> getErrorAttributes(ServerRequest request, boolean includeStackTrace) {
    Map<String, Object> errorAttrs = super.getErrorAttributes(request, includeStackTrace);
    includeCustomErrorAttributes(request, errorAttrs);
    return errorAttrs;
  }

  private void includeCustomErrorAttributes(ServerRequest request, Map<String, Object> errorAttrs) {
    Throwable error = getError(request);
    if (error instanceof WebClientResponseException) {
      var webClientError = (WebClientResponseException) error;
      errorAttrs.put(STATUS, webClientError.getStatusCode());
    } else if (error instanceof CustomBaseException) {
      var customBaseError = (CustomBaseException) error;
      errorAttrs.put(STATUS, customBaseError.getResponseStatusCode());
    }
  }
}
