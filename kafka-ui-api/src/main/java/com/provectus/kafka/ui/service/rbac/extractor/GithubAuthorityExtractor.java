package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
public class GithubAuthorityExtractor implements ProviderAuthorityExtractor {

  private static final String ORGANIZATION_ATTRIBUTE_NAME = "organizations_url";
  private static final String USERNAME_ATTRIBUTE_NAME = "login";
  private static final String ORGANIZATION_NAME = "login";
  private static final String GITHUB_ACCEPT_HEADER = "application/vnd.github+json";

  private final WebClient webClient = WebClient.create("https://api.github.com");

  @Override
  public boolean isApplicable(String provider) {
    return Provider.Name.GITHUB.equalsIgnoreCase(provider);
  }

  @Override
  public Mono<List<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    DefaultOAuth2User principal;
    try {
      principal = (DefaultOAuth2User) value;
    } catch (ClassCastException e) {
      log.error("Can't cast value to DefaultOAuth2User", e);
      throw new RuntimeException();
    }

    List<String> groupsByUsername = new ArrayList<>();
    String username = principal.getAttribute(USERNAME_ATTRIBUTE_NAME);
    if (username == null) {
      log.debug("Github username param is not present");
    } else {
      acs.getRoles()
          .stream()
          .filter(r -> r.getSubjects()
              .stream()
              .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB))
              .filter(s -> s.getType().equals("user"))
              .anyMatch(s -> s.getValue().equals(username)))
          .map(Role::getName)
          .forEach(groupsByUsername::add);
    }

    String organization = principal.getAttribute(ORGANIZATION_ATTRIBUTE_NAME);
    if (organization == null) {
      log.debug("Github organization param is not present");
      return Mono.just(groupsByUsername);
    }

    final Mono<List<Map<String, Object>>> userOrganizations = webClient
        .get()
        .uri("/user/orgs")
        .headers(headers -> {
          headers.set(HttpHeaders.ACCEPT, GITHUB_ACCEPT_HEADER);
          OAuth2UserRequest request = (OAuth2UserRequest) additionalParams.get("request");
          headers.setBearerAuth(request.getAccessToken().getTokenValue());
        })
        .retrieve()
        //@formatter:off
        .bodyToMono(new ParameterizedTypeReference<>() {});
    //@formatter:on

    return userOrganizations
        .map(orgsMap -> {
          var groupsByOrg = acs.getRoles()
              .stream()
              .map(Role::getSubjects)
              .flatMap(Collection::stream)
              .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB))
              .filter(s -> s.getType().equals("organization"))
              .flatMap(subject -> Stream.of(orgsMap)
                  .filter(orgs -> orgs
                      .stream()
                      .anyMatch(org -> org.get(ORGANIZATION_NAME).toString().equalsIgnoreCase(subject.getValue()))
                  )
                  .map(Object::toString)
              );

          return Stream.concat(groupsByOrg, groupsByUsername.stream()).collect(Collectors.toList());
        });
  }

}
