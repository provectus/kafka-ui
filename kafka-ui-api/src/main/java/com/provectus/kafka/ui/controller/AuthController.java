package com.provectus.kafka.ui.controller;

import java.nio.charset.Charset;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  @GetMapping(value = "/auth", produces = {"text/html"})
  public Mono<byte[]> getAuth(ServerWebExchange exchange) {
    Mono<CsrfToken> token = exchange.getAttributeOrDefault(CsrfToken.class.getName(), Mono.empty());
    return token
        .map(AuthController::csrfToken)
        .defaultIfEmpty("")
        .map(csrfTokenHtmlInput -> createPage(exchange, csrfTokenHtmlInput));
  }

  private byte[] createPage(ServerWebExchange exchange, String csrfTokenHtmlInput) {
    MultiValueMap<String, String> queryParams = exchange.getRequest()
        .getQueryParams();
    String contextPath = exchange.getRequest().getPath().contextPath().value();
    String page =
        "<!DOCTYPE html>\n" + "<html lang=\"en\">\n" + "  <head>\n"
            + "    <meta charset=\"utf-8\">\n"
            + "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, "
            + "shrink-to-fit=no\">\n"
            + "    <meta name=\"description\" content=\"\">\n"
            + "    <meta name=\"author\" content=\"\">\n"
            + "    <title>Please sign in</title>\n"
            + "    <link href=\"https://maxcdn.bootstrapcdn.com/bootstrap/"
            + "4.0.0-beta/css/bootstrap.min.css\" rel=\"stylesheet\" "
            + "integrity=\"sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M\" "
            + "crossorigin=\"anonymous\">\n"
            + "    <link href=\"https://getbootstrap.com/docs/4.0/examples/signin/signin.css\" "
            + "rel=\"stylesheet\" crossorigin=\"anonymous\"/>\n"
            + "  </head>\n"
            + "  <body>\n"
            + "     <div class=\"container\">\n"
            + formLogin(queryParams, contextPath, csrfTokenHtmlInput)
            + "    </div>\n"
            + "  </body>\n"
            + "</html>";

    return page.getBytes(Charset.defaultCharset());
  }

  private String formLogin(
      MultiValueMap<String, String> queryParams,
      String contextPath, String csrfTokenHtmlInput) {

    boolean isError = queryParams.containsKey("error");
    boolean isLogoutSuccess = queryParams.containsKey("logout");
    return
        "      <form class=\"form-signin\" method=\"post\" action=\"" + contextPath + "/auth\">\n"
            + "        <h2 class=\"form-signin-heading\">Please sign in</h2>\n"
            + createError(isError)
            + createLogoutSuccess(isLogoutSuccess)
            + "        <p>\n"
            + "          <label for=\"username\" class=\"sr-only\">Username</label>\n"
            + "          <input type=\"text\" id=\"username\" name=\"username\" class=\"form-control\" "
            + "placeholder=\"Username\" required autofocus>\n"
            + "        </p>\n" + "        <p>\n"
            + "          <label for=\"password\" class=\"sr-only\">Password</label>\n"
            + "          <input type=\"password\" id=\"password\" name=\"password\" "
            + "class=\"form-control\" placeholder=\"Password\" required>\n"
            + "        </p>\n" + csrfTokenHtmlInput
            + "        <button class=\"btn btn-lg btn-primary btn-block\" "
            + "type=\"submit\">Sign in</button>\n"
            + "      </form>\n";
  }

  private static String csrfToken(CsrfToken token) {
    return "          <input type=\"hidden\" name=\""
        + token.getParameterName()
        + "\" value=\""
        + token.getToken()
        + "\">\n";
  }

  private static String createError(boolean isError) {
    return isError
        ? "<div class=\"alert alert-danger\" role=\"alert\">Invalid credentials</div>"
        : "";
  }

  private static String createLogoutSuccess(boolean isLogoutSuccess) {
    return isLogoutSuccess
        ? "<div class=\"alert alert-success\" role=\"alert\">You have been signed out</div>"
        : "";
  }
}
