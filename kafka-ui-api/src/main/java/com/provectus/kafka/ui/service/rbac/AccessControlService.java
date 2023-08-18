package com.provectus.kafka.ui.service.rbac;

import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.config.auth.RbacUser;
import com.provectus.kafka.ui.config.auth.RoleBasedAccessControlProperties;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.Subject;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import com.provectus.kafka.ui.service.rbac.extractor.CognitoAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.GithubAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.GoogleAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.OauthAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.ProviderAuthorityExtractor;
import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.env.Environment;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@EnableConfigurationProperties(RoleBasedAccessControlProperties.class)
@Slf4j
public class AccessControlService {

  private static final String ACCESS_DENIED = "Access denied";

  @Nullable
  private final InMemoryReactiveClientRegistrationRepository clientRegistrationRepository;
  private final RoleBasedAccessControlProperties properties;
  private final Environment environment;

  private boolean rbacEnabled = false;
  private Set<ProviderAuthorityExtractor> oauthExtractors = Collections.emptySet();

  @PostConstruct
  public void init() {
    if (CollectionUtils.isEmpty(properties.getRoles())) {
      log.trace("No roles provided, disabling RBAC");
      return;
    }
    rbacEnabled = true;

    this.oauthExtractors = properties.getRoles()
        .stream()
        .map(role -> role.getSubjects()
            .stream()
            .map(Subject::getProvider)
            .distinct()
            .map(provider -> switch (provider) {
              case OAUTH_COGNITO -> new CognitoAuthorityExtractor();
              case OAUTH_GOOGLE -> new GoogleAuthorityExtractor();
              case OAUTH_GITHUB -> new GithubAuthorityExtractor();
              case OAUTH -> new OauthAuthorityExtractor();
              default -> null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toSet()))
        .flatMap(Set::stream)
        .collect(Collectors.toSet());

    if (!properties.getRoles().isEmpty()
        && "oauth2".equalsIgnoreCase(environment.getProperty("auth.type"))
        && (clientRegistrationRepository == null || !clientRegistrationRepository.iterator().hasNext())) {
      log.error("Roles are configured but no authentication methods are present. Authentication might fail.");
    }
  }

  public Mono<Void> validateAccess(AccessContext context) {
    if (!rbacEnabled) {
      return Mono.empty();
    }
    return getUser()
        .doOnNext(user -> {
          if (!isAccessible(user, context)) {
            throw new AccessDeniedException(ACCESS_DENIED);
          }
        })
        .then();
  }

  private boolean isAccessible(AuthenticatedUser user, AccessContext context) {
    if (context.getCluster() != null && !isClusterAccessible(context.getCluster(), user)) {
      return false;
    }

    List<Permission> allUserPermissions = properties.getRoles().stream()
        .filter(filterRole(user))
        .flatMap(role -> role.getPermissions().stream())
        .toList();

    return context.getAccesses().stream()
        .allMatch(resourceAccess -> resourceAccess.isAccessible(allUserPermissions));
  }

  public Mono<AuthenticatedUser> getUser() {
    return ReactiveSecurityContextHolder.getContext()
        .map(SecurityContext::getAuthentication)
        .filter(authentication -> authentication.getPrincipal() instanceof RbacUser)
        .map(authentication -> ((RbacUser) authentication.getPrincipal()))
        .map(user -> new AuthenticatedUser(user.name(), user.groups()));
  }

  private boolean isClusterAccessible(String clusterName, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    Assert.isTrue(StringUtils.isNotEmpty(clusterName), "cluster value is empty");

    return properties.getRoles()
        .stream()
        .filter(filterRole(user))
        .anyMatch(role -> role.getClusters().stream().anyMatch(clusterName::equalsIgnoreCase));
  }

  public Mono<Boolean> isClusterAccessible(ClusterDTO cluster) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }
    return getUser().map(u -> isClusterAccessible(cluster.getName(), u));
  }

  public Mono<List<InternalTopic>> filterViewableTopics(List<InternalTopic> topics, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(topics);
    }
    return getUser()
        .map(user -> topics.stream()
            .filter(topic -> {
                  var accessContext = AccessContext
                      .builder()
                      .cluster(clusterName)
                      .topicActions(topic.getName(), TopicAction.VIEW)
                      .build();
                  return isAccessible(user, accessContext);
                }
            ).toList());
  }

  public Mono<Boolean> isConsumerGroupAccessible(String groupId, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .consumerGroupActions(groupId, ConsumerGroupAction.VIEW)
        .build();

    return getUser().map(u -> isAccessible(u, accessContext));
  }

  public Mono<Boolean> isSchemaAccessible(String schema, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .schemaActions(schema, SchemaAction.VIEW)
        .build();

    return getUser().map(u -> isAccessible(u, accessContext));
  }

  public Mono<Boolean> isConnectAccessible(ConnectDTO dto, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }
    return isConnectAccessible(dto.getName(), clusterName);
  }

  public Mono<Boolean> isConnectAccessible(String connectName, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .connectActions(connectName, ConnectAction.VIEW)
        .build();

    return getUser().map(u -> isAccessible(u, accessContext));
  }

  public Set<ProviderAuthorityExtractor> getOauthExtractors() {
    return oauthExtractors;
  }

  public List<Role> getRoles() {
    if (!rbacEnabled) {
      return Collections.emptyList();
    }
    return Collections.unmodifiableList(properties.getRoles());
  }

  private Predicate<Role> filterRole(AuthenticatedUser user) {
    return role -> user.groups().contains(role.getName());
  }

  public boolean isRbacEnabled() {
    return rbacEnabled;
  }
}
