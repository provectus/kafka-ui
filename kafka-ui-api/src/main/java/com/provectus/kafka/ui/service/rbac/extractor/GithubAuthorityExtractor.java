package com.provectus.kafka.ui.service.rbac.extractor;

import static com.provectus.kafka.ui.model.rbac.provider.Provider.Name.GITHUB;

import com.nimbusds.jose.util.Pair;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.Subject;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.HashMap;
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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
public class GithubAuthorityExtractor implements ProviderAuthorityExtractor {

  private static final String ORGANIZATION_ATTRIBUTE_NAME = "organizations_url";
  private static final String USERNAME_ATTRIBUTE_NAME = "login";
  private static final String ORGANIZATION_NAME = "login";
  private static final String GITHUB_ACCEPT_HEADER = "application/vnd.github+json";
  private static final String GITHUB_TEAMS_URL = "https://api.github.com/orgs/%s/teams/%s/memberships/%s";
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

    Set<String> groupsByUsernameAndTeams = new HashSet<>();
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
          .forEach(groupsByUsernameAndTeams::add);
    }

    String organization = principal.getAttribute(ORGANIZATION_ATTRIBUTE_NAME);
    if (organization == null) {
      log.debug("Github organization param is not present");
      return Mono.just(groupsByUsernameAndTeams);
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

    WebClient webClient = WebClient.create(infoEndpoint);

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

    Map<Role, List<Subject>> teamsMap = new HashMap<>();
    acs.getRoles().forEach(r -> {
      List<Subject> subjects = r.getSubjects().stream()
          .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB) && s.getType().equals("team")).toList();
      teamsMap.put(r, subjects);
    });

    Flux<Pair<Role, Object>> teams = Flux.fromIterable(acs.getRoles())
        .flatMap(role -> Flux.fromIterable(role.getSubjects())
            .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB) && s.getType().equals("team"))
            .flatMap(subject -> {
              String orgTeam = subject.getValue();
              if (orgTeam.contains("/")) {
                String[] organizationAndTeam = orgTeam.split("/");
                String org = organizationAndTeam[0];
                String team = organizationAndTeam[1];
                WebClient wc = WebClient.create(
                    String.format(GITHUB_TEAMS_URL, org, team, username));

                return wc.get()
                    .headers(headers -> {
                      headers.set(HttpHeaders.ACCEPT, GITHUB_ACCEPT_HEADER);
                      OAuth2UserRequest request = (OAuth2UserRequest) additionalParams.get("request");
                      headers.setBearerAuth(request.getAccessToken().getTokenValue());
                    })
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<>() {})
                    .onErrorResume(Exception.class, ex -> Mono.just(new HashMap<String, String>()))
                    .map(m -> Pair.of(role, m))
                    .flux();
              }
              return Flux.empty();
            })
        );

    return teams
        .doOnNext(t -> {
          if (t.getRight() instanceof Map) {
            Map<String, String> response = (Map<String, String>) t.getRight();
            if (response.containsKey("state") && response.get("state").equals("active")) {
              groupsByUsernameAndTeams.add(t.getLeft().getName());
            }
          }
        })
        .then(userOrganizations
            .map(orgsMap -> {
              var groupsByOrg = acs.getRoles()
                  .stream()
                  .filter(role -> role.getSubjects()
                      .stream()
                      .filter(s -> s.getProvider().equals(Provider.OAUTH_GITHUB))
                      .filter(s -> s.getType().equals("organization"))
                      .anyMatch(subject -> orgsMap.stream()
                          .map(org -> org.get(ORGANIZATION_NAME).toString())
                          .distinct()
                          .anyMatch(orgName -> orgName.equalsIgnoreCase(subject.getValue()))
                      ))
                  .map(Role::getName);

              return Stream.concat(groupsByOrg, groupsByUsernameAndTeams.stream()).collect(Collectors.toSet());
            }));
  }
}
