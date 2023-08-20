package com.provectus.kafka.ui.service.rbac.extractor;

import static com.provectus.kafka.ui.model.rbac.provider.Provider.Name.GITHUB;

import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
public class GithubAuthorityExtractor implements ProviderAuthorityExtractor {

  private static final String ORGANIZATION_ATTRIBUTE_NAME = "organizations_url";
  private static final String USERNAME_ATTRIBUTE_NAME = "login";
  private static final String ORGANIZATION_NAME = "login";
  private static final String ORGANIZATION = "organization";
  private static final String TEAM_NAME = "slug";
  private static final String GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
  private static final String DUMMY = "dummy";
  // The number of results (max 100) per page of list organizations for authenticated user.
  private static final Integer ORGANIZATIONS_PER_PAGE = 100;

  @Override
  public boolean isApplicable(String provider, Map<String, String> customParams) {
    return GITHUB.equalsIgnoreCase(provider) || GITHUB.equalsIgnoreCase(customParams.get(TYPE));
  }

  @Override
  public Mono<Set<String>> extract(AccessControlService acs, Object value, Map<String, Object> additionalParams) {
    DefaultOAuth2User principal;
    try {
      principal = (DefaultOAuth2User) value;
    } catch (ClassCastException e) {
      log.error("Can't cast value to DefaultOAuth2User", e);
      throw new RuntimeException();
    }

    Set<String> rolesByUsername = new HashSet<>();
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
          .forEach(rolesByUsername::add);
    }

    OAuth2UserRequest req = (OAuth2UserRequest) additionalParams.get("request");
    String infoEndpoint = req.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUri();

    if (infoEndpoint == null) {
      infoEndpoint = CommonOAuth2Provider.GITHUB
          .getBuilder(DUMMY)
          .clientId(DUMMY)
          .build()
          .getProviderDetails()
          .getUserInfoEndpoint()
          .getUri();
    }
    var webClient = WebClient.create(infoEndpoint);

    Mono<Set<String>> rolesByOrganization = getOrganizationRoles(principal, additionalParams, acs, webClient);
    Mono<Set<String>> rolesByTeams = getTeamRoles(webClient, additionalParams, acs);

    return Mono.zip(rolesByOrganization, rolesByTeams)
        .map((t) -> Stream.of(t.getT1(), t.getT2(), rolesByUsername)
            .flatMap(Collection::stream)
            .collect(Collectors.toSet()));
  }

  private Mono<Set<String>> getOrganizationRoles(DefaultOAuth2User principal, Map<String, Object> additionalParams,
                                                 AccessControlService acs, WebClient webClient) {
    String organization = principal.getAttribute(ORGANIZATION_ATTRIBUTE_NAME);
    if (organization == null) {
      log.debug("Github organization param is not present");
      return Mono.just(Collections.emptySet());
    }

    final Mono<List<Map<String, Object>>> userOrganizations = webClient
        .get()
        .uri(uriBuilder -> uriBuilder.path("/orgs")
            .queryParam("per_page", ORGANIZATIONS_PER_PAGE)
            .build())
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
        .map(orgsMap -> acs.getRoles()
            .stream()
            .filter(role -> role.getSubjects()
                .stream()
                .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB))
                .filter(s -> s.getType().equals(ORGANIZATION))
                .anyMatch(subject -> orgsMap.stream()
                    .map(org -> org.get(ORGANIZATION_NAME).toString())
                    .anyMatch(orgName -> orgName.equalsIgnoreCase(subject.getValue()))
                ))
            .map(Role::getName)
            .collect(Collectors.toSet()));
  }

  @SuppressWarnings("unchecked")
  private Mono<Set<String>> getTeamRoles(WebClient webClient, Map<String, Object> additionalParams,
                                         AccessControlService acs) {

    var requestedTeams = acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB))
            .anyMatch(s -> s.getType().equals("team")))
        .collect(Collectors.toSet());

    if (requestedTeams.isEmpty()) {
      log.debug("No roles with github teams found, skipping");
      return Mono.just(Collections.emptySet());
    }

    final Mono<List<Map<String, Object>>> rawTeams = webClient
        .get()
        .uri(uriBuilder -> uriBuilder.path("/teams")
            .queryParam("per_page", ORGANIZATIONS_PER_PAGE)
            .build())
        .headers(headers -> {
          headers.set(HttpHeaders.ACCEPT, GITHUB_ACCEPT_HEADER);
          OAuth2UserRequest request = (OAuth2UserRequest) additionalParams.get("request");
          headers.setBearerAuth(request.getAccessToken().getTokenValue());
        })
        .retrieve()
        //@formatter:off
        .bodyToMono(new ParameterizedTypeReference<>() {});
    //@formatter:on

    final Mono<List<String>> mappedTeams = rawTeams
        .map(teams -> teams.stream()
            .map(teamInfo -> {
              var name = teamInfo.get(TEAM_NAME);
              var orgInfo = (Map<String, Object>) teamInfo.get(ORGANIZATION);
              var orgName = orgInfo.get(ORGANIZATION_NAME);
              return orgName + "/" + name;
            })
            .map(Object::toString)
            .collect(Collectors.toList())
        );

    return mappedTeams
        .map(teams -> acs.getRoles()
            .stream()
            .filter(role -> role.getSubjects()
                .stream()
                .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB))
                .filter(s -> s.getType().equals("team"))
                .anyMatch(subject -> teams.stream()
                    .anyMatch(teamName -> teamName.equalsIgnoreCase(subject.getValue()))
                ))
            .map(Role::getName)
            .collect(Collectors.toSet()));
  }

}
