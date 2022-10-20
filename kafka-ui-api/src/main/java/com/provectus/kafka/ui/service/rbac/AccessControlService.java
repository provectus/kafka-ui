package com.provectus.kafka.ui.service.rbac;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.ConsumerGroupDTO;
import com.provectus.kafka.ui.model.InternalConsumerGroup;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.TopicDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.permission.ClusterAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectorAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import com.provectus.kafka.ui.service.rbac.extractor.CognitoAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.GithubAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.GoogleAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.LdapAuthorityExtractor;
import com.provectus.kafka.ui.service.rbac.extractor.ProviderAuthorityExtractor;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccessControlService {

  private final Environment environment;

  private final Cache<String, AuthenticatedUser> cachedUsers = CacheBuilder.newBuilder() // TODO cache supporting flux
      .maximumSize(10000)
      .expireAfterAccess(5, TimeUnit.MINUTES) // todo configurable
      .build();
  private Set<ProviderAuthorityExtractor> extractors;
  private List<Role> roles;

  @PostConstruct
  public void init() {
    String rawProperty = environment.getProperty("roles.file"); // TODO cacherefresh
    if (rawProperty == null) {
      log.trace("No roles file is provided");
      return;
    }

    Path rolesFilePath = Paths.get(rawProperty);

    if (Files.notExists(rolesFilePath)) {
      log.error("Roles file path provided but the file doesn't exist");
      throw new IllegalArgumentException();
    }

    if (!Files.isReadable(rolesFilePath)) {
      log.error("Roles file path provided but the file isn't readable");
      throw new IllegalArgumentException();
    }

    var mapper = YAMLMapper
        .builder()
        .enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS)
        .findAndAddModules()
        .build();

    try {
      //@formatter:off
      this.roles = mapper.readValue(rolesFilePath.toFile(), new TypeReference<>() {});
      //@formatter:on

      this.extractors = roles
          .stream()
          .map(role -> role.getSubjects()
              .stream()
              .map(provider -> {
                switch (provider.getProvider()) {
                  case OAUTH_COGNITO:
                    return new CognitoAuthorityExtractor();
                  case OAUTH_GOOGLE:
                    return new GoogleAuthorityExtractor();
                  case OAUTH_GITHUB:
                    return new GithubAuthorityExtractor();
                  case LDAP:
                  case LDAP_AD:
                    return new LdapAuthorityExtractor();
                  default:
                    return null;
                }
              }).collect(Collectors.toSet()))
          .flatMap(Set::stream)
          .collect(Collectors.toSet());

    } catch (IOException e) {
      throw new RuntimeException("Can't deserialize roles file", e);
    }

  }

  public AccessContext.AccessContextBuilder builder() {
    return AccessContext.builder();
  }

  public Mono<Void> validateAccess(AccessContext context) {
    return getCachedUser()
        .doOnNext(user -> {
          boolean accessGranted =
              isClusterAccessible(context, user)
                  && isTopicAccessible(context, user)
                  && isConsumerGroupAccessible(context, user)
                  && isConnectAccessible(context, user)
                  && isConnectorAccessible(context, user) // TODO connector selectors
                  && isSchemaAccessible(context, user)
                  && isKsqlAccessible(context, user);

          if (!accessGranted) {
            throw new AccessDeniedException("Access denied");
          }
        })
        .then();
  }

  public void cacheUser(AuthenticatedUser user) {
    cachedUsers.put(user.getPrincipal(), user);
  }

  public Mono<AuthenticatedUser> getCachedUser() {
    return ReactiveSecurityContextHolder.getContext()
        .map(SecurityContext::getAuthentication)
        .map(Principal::getName)
        .flatMap(this::getCachedUser);
  }

  private Mono<AuthenticatedUser> getCachedUser(String principal) {
    AuthenticatedUser user = cachedUsers.getIfPresent(principal);
    if (user != null) {
      return Mono.just(user);
    }

    return Mono.just(new AuthenticatedUser(principal, Collections.emptySet()))
        .doOnNext(u -> cachedUsers.put(principal, u));
  }

  private boolean isClusterAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getClusterActions().isEmpty()) {
      log.trace("actions are empty, skipping");
      return true;
    }

    if (context.getCluster() == null) {
      throw new IllegalArgumentException();
    }

    Set<String> requiredActions = context.getClusterActions()
        .stream()
        .map(a -> a.toString().toLowerCase())
        .collect(Collectors.toSet());

    return isAccessible("cluster", null, user, context, requiredActions);
  }

  public Mono<Boolean> isClusterAccessible(ClusterDTO cluster) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(cluster.getName())
        .clusterActions(ClusterAction.VIEW)
        .build();

    return getCachedUser().map(u -> isClusterAccessible(accessContext, u));
  }

  private boolean isTopicAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getTopicActions().isEmpty()) {
      log.trace("actions are empty, skipping");
      return true;
    }

    if (context.getTopic() == null) {
      throw new IllegalArgumentException();
    }

    Set<String> requiredActions = context.getTopicActions()
        .stream()
        .map(a -> a.toString().toLowerCase())
        .collect(Collectors.toSet());

    return isAccessible("topic", context.getTopic(), user, context, requiredActions);
  }

  public Mono<Boolean> isTopicAccessible(InternalTopic dto) {
    AccessContext accessContext = AccessContext
        .builder()
        .topic(dto.getName())
        .topicActions(TopicAction.VIEW)
        .build();

    return getCachedUser().map(u -> isTopicAccessible(accessContext, u));
  }

  private boolean isConsumerGroupAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getConsumerGroupActions().isEmpty()) {
      log.trace("actions are empty, skipping");
      return true;
    }

    if (context.getConsumerGroup() == null) {
      throw new IllegalArgumentException();
    }

    Set<String> requiredActions = context.getConsumerGroupActions()
        .stream()
        .map(a -> a.toString().toLowerCase())
        .collect(Collectors.toSet());

    return isAccessible("consumer", context.getConsumerGroup(), user, context, requiredActions);
  }

  public Mono<Boolean> isConsumerGroupAccessible(InternalConsumerGroup dto) {
    AccessContext accessContext = AccessContext
        .builder()
        .consumerGroup(dto.getGroupId())
        .consumerGroupActions(ConsumerGroupAction.VIEW)
        .build();

    return getCachedUser().map(u -> isConsumerGroupAccessible(accessContext, u));
  }

  private boolean isSchemaAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getSchemaActions().isEmpty()) {
      log.trace("actions are empty, skipping");
      return true;
    }

    if (context.getSchema() == null) {
      throw new IllegalArgumentException();
    }

    Set<String> requiredActions = context.getSchemaActions()
        .stream()
        .map(a -> a.toString().toLowerCase())
        .collect(Collectors.toSet());

    return isAccessible("schema", context.getSchema(), user, context, requiredActions);
  }

  public Mono<Boolean> isSchemaAccessible(String schema) {
    AccessContext accessContext = AccessContext
        .builder()
        .schema(schema)
        .schemaActions(SchemaAction.VIEW)
        .build();

    return getCachedUser().map(u -> isSchemaAccessible(accessContext, u));
  }

  private boolean isConnectAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getConnectActions().isEmpty()) {
      log.trace("actions are empty, skipping");
      return true;
    }

    if (context.getConnect() == null) {
      throw new IllegalArgumentException();
    }

    Set<String> requiredActions = context.getConnectActions()
        .stream()
        .map(a -> a.toString().toLowerCase())
        .collect(Collectors.toSet());

    return isAccessible("connect", context.getConnect(), user, context, requiredActions);
  }

  public Mono<Boolean> isConnectAccessible(ConnectDTO dto) {
    return isConnectAccessible(dto.getName());
  }

  public Mono<Boolean> isConnectAccessible(String connectName) {
    AccessContext accessContext = AccessContext
        .builder()
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .build();

    return getCachedUser().map(u -> isConnectAccessible(accessContext, u));
  }


  public boolean isConnectorAccessible(AccessContext context, AuthenticatedUser user) {
    return isConnectAccessible(context, user);
  }

  public Mono<Boolean> isConnectorAccessible(String connectName, String connectorName) {
    AccessContext accessContext = AccessContext
        .builder()
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connector(connectorName)
        .connectorActions(ConnectorAction.VIEW)
        .build();

    return getCachedUser().map(u -> isConnectorAccessible(accessContext, u));
  }

  private boolean isKsqlAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getKsqlActions().isEmpty()) {
      log.trace("actions are empty, skipping");
      return true;
    }

    Set<String> requiredActions = context.getKsqlActions()
        .stream()
        .map(a -> a.toString().toLowerCase())
        .collect(Collectors.toSet());

    return isAccessible("ksql", null, user, context, requiredActions);
  }

  public Set<ProviderAuthorityExtractor> getExtractors() {
    return extractors;
  }

  public List<Role> getRoles() {
    return Collections.unmodifiableList(roles);
  }

  private boolean isAccessible(String resourceName, String resourceValue,
                               AuthenticatedUser user, AccessContext context, Set<String> requiredActions) {
    return roles
        .stream()
        .filter(filterRole(user))
        .filter(filterCluster(context.getCluster()))
        .flatMap(grantedRole -> grantedRole.getPermissions().stream())
        .filter(filterResource(resourceName))
        .filter(filterResourceValue(resourceValue))
        .flatMap(grantedPermission -> grantedPermission.getActions().stream())
        .allMatch(requiredActions::contains);
  }

  private Predicate<Role> filterRole(AuthenticatedUser user) {
    return role -> user.getGroups().contains(role.getName());
  }

  private Predicate<Role> filterCluster(String clusterExp) {
    return grantedRole -> grantedRole.getClusters()
        .stream()
        .anyMatch(clusterExp::matches);
  }

  private Predicate<Permission> filterResource(String resource) {
    return grantedPermission -> resource.equalsIgnoreCase(grantedPermission.getResource());
  }

  private Predicate<Permission> filterResourceValue(String object) {
    if (object == null) {
      return grantedPermission -> true;
    }
    return grantedPermission -> grantedPermission.getName().matches(object);
  }

}
