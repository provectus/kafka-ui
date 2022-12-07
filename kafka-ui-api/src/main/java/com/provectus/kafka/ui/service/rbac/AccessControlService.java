package com.provectus.kafka.ui.service.rbac;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.exception.NotFoundException;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.model.rbac.Resource;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
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
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
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
@Slf4j
public class AccessControlService {

  private final Environment environment;
  private final InMemoryReactiveClientRegistrationRepository clientRegistrationRepository;

  private final Cache<String, AuthenticatedUser> cachedUsers = CacheBuilder.newBuilder() // TODO cache supporting flux
      .maximumSize(10000)
      .build();
  private boolean rbacEnabled = false;
  private Set<ProviderAuthorityExtractor> extractors;
  private List<Role> roles;

  @PostConstruct
  public void init() {
    String rawProperty = environment.getProperty("roles.file");
    if (rawProperty == null) {
      log.trace("No roles file is provided");
      return;
    }
    rbacEnabled = true;

    Path rolesFilePath = Paths.get(rawProperty);

    if (Files.notExists(rolesFilePath)) {
      log.trace("Roles file path: [{}]", rolesFilePath);
      throw new NotFoundException("Roles file path provided but the file doesn't exist");
    }

    if (!Files.isReadable(rolesFilePath)) {
      log.trace("Roles file path: [{}]", rolesFilePath);
      throw new NotFoundException("Roles file path provided but the file isn't readable");
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
              .map(provider -> switch (provider.getProvider()) {
                case OAUTH_COGNITO -> new CognitoAuthorityExtractor();
                case OAUTH_GOOGLE -> new GoogleAuthorityExtractor();
                case OAUTH_GITHUB -> new GithubAuthorityExtractor();
                case LDAP, LDAP_AD -> new LdapAuthorityExtractor();
              }).collect(Collectors.toSet()))
          .flatMap(Set::stream)
          .collect(Collectors.toSet());

    } catch (IOException e) {
      throw new RuntimeException("Can't deserialize roles file", e);
    }

    if (!clientRegistrationRepository.iterator().hasNext() && !roles.isEmpty()) {
      log.error("Roles are configured but no authentication methods are present. Authentication might fail.");
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
                  && isClusterConfigAccessible(context, user)
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

    if (user == null) {
      throw new IllegalArgumentException("User not found in cache");
    }

    return Mono.just(user);
  }

  public Mono<Boolean> canCreateResource(Resource resource, String cluster, String resourceName) {
    return switch (resource) {
      case TOPIC -> {
        AccessContext context = AccessContext.builder()
            .cluster(cluster)
            .topic(resourceName)
            .topicActions(TopicAction.CREATE)
            .build();

        yield getCachedUser()
            .map(user -> isTopicAccessible(context, user));
      }

      case SCHEMA -> {
        AccessContext context = AccessContext.builder()
            .cluster(cluster)
            .schema(resourceName)
            .schemaActions(SchemaAction.CREATE)
            .build();

        yield getCachedUser()
            .map(user -> isSchemaAccessible(context, user));
      }

      case CONNECT -> {
        AccessContext context = AccessContext.builder()
            .cluster(cluster)
            .connect(resourceName)
            .connectActions(ConnectAction.CREATE)
            .build();

        yield getCachedUser()
            .map(user -> isConnectAccessible(context, user));
      }

      default -> Mono.just(false);
    };
  }

  private boolean isClusterAccessible(AccessContext context, AuthenticatedUser user) {
    Assert.isTrue(StringUtils.isNotEmpty(context.getCluster()), "cluster value is empty");

    return roles
        .stream()
        .filter(filterRole(user))
        .anyMatch(filterCluster(context.getCluster()));
  }

  public Mono<Boolean> isClusterAccessible(ClusterDTO cluster) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(cluster.getName())
        .build();

    return getCachedUser().map(u -> isClusterAccessible(accessContext, u));
  }

  public boolean isClusterConfigAccessible(AccessContext context, AuthenticatedUser user) {
    if (CollectionUtils.isEmpty(context.getClusterConfigActions())) {
      return true;
    }
    Assert.isTrue(StringUtils.isNotEmpty(context.getCluster()), "cluster value is empty");

    Set<String> requiredActions = context.getClusterConfigActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.CLUSTERCONFIG, context.getCluster(), user, context, requiredActions);
  }

  public boolean isTopicAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getTopic() == null && context.getTopicActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getTopicActions().isEmpty(), "actions are empty");

    Set<String> requiredActions = context.getTopicActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.TOPIC, context.getTopic(), user, context, requiredActions);
  }

  public Mono<Boolean> isTopicAccessible(InternalTopic dto, String clusterName) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .topic(dto.getName())
        .topicActions(TopicAction.VIEW)
        .build();

    return getCachedUser().map(u -> isTopicAccessible(accessContext, u));
  }

  private boolean isConsumerGroupAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getConsumerGroup() == null && context.getConsumerGroupActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getConsumerGroupActions().isEmpty(), "actions are empty");

    Set<String> requiredActions = context.getConsumerGroupActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.CONSUMER, context.getConsumerGroup(), user, context, requiredActions);
  }

  public Mono<Boolean> isConsumerGroupAccessible(String groupId, String clusterName) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .consumerGroup(groupId)
        .consumerGroupActions(ConsumerGroupAction.VIEW)
        .build();

    return getCachedUser().map(u -> isConsumerGroupAccessible(accessContext, u));
  }

  public boolean isSchemaAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getSchema() == null && context.getSchemaActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getSchemaActions().isEmpty(), "actions are empty");

    Set<String> requiredActions = context.getSchemaActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.SCHEMA, context.getSchema(), user, context, requiredActions);
  }

  public Mono<Boolean> isSchemaAccessible(String schema, String clusterName) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .schema(schema)
        .schemaActions(SchemaAction.VIEW)
        .build();

    return getCachedUser().map(u -> isSchemaAccessible(accessContext, u));
  }

  public boolean isConnectAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getConnect() == null && context.getConnectActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getConnectActions().isEmpty(), "actions are empty");

    Set<String> requiredActions = context.getConnectActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.CONNECT, context.getConnect(), user, context, requiredActions);
  }

  public Mono<Boolean> isConnectAccessible(ConnectDTO dto, String clusterName) {
    return isConnectAccessible(dto.getName(), clusterName);
  }

  public Mono<Boolean> isConnectAccessible(String connectName, String clusterName) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .build();

    return getCachedUser().map(u -> isConnectAccessible(accessContext, u));
  }


  public boolean isConnectorAccessible(AccessContext context, AuthenticatedUser user) {
    return isConnectAccessible(context, user);
  }

  public Mono<Boolean> isConnectorAccessible(String connectName, String connectorName, String clusterName) {
    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connector(connectorName)
        .build();

    return getCachedUser().map(u -> isConnectorAccessible(accessContext, u));
  }

  private boolean isKsqlAccessible(AccessContext context, AuthenticatedUser user) {
    if (context.getKsqlActions().isEmpty()) {
      return true;
    }

    Set<String> requiredActions = context.getKsqlActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.KSQL, null, user, context, requiredActions);
  }

  public Set<ProviderAuthorityExtractor> getExtractors() {
    return extractors;
  }

  public List<Role> getRoles() {
    return Collections.unmodifiableList(roles);
  }

  private boolean isAccessible(Resource resource, String resourceValue,
                               AuthenticatedUser user, AccessContext context, Set<String> requiredActions) {
    Set<String> grantedActions = roles
        .stream()
        .filter(filterRole(user))
        .filter(filterCluster(context.getCluster()))
        .flatMap(grantedRole -> grantedRole.getPermissions().stream())
        .filter(filterResource(resource))
        .filter(filterResourceValue(resourceValue))
        .flatMap(grantedPermission -> grantedPermission.getActions().stream())
        .map(String::toUpperCase)
        .collect(Collectors.toSet());

    return grantedActions.containsAll(requiredActions);
  }

  private Predicate<Role> filterRole(AuthenticatedUser user) {
    return role -> user.getGroups().contains(role.getName());
  }

  private Predicate<Role> filterCluster(String cluster) {
    return grantedRole -> grantedRole.getClusters()
        .stream()
        .anyMatch(cluster::equalsIgnoreCase);
  }

  private Predicate<Permission> filterResource(Resource resource) {
    return grantedPermission -> resource == grantedPermission.getResource();
  }

  private Predicate<Permission> filterResourceValue(String resourceValue) {

    if (resourceValue == null) {
      return grantedPermission -> true;
    }
    return grantedPermission -> {
      Pattern value = grantedPermission.getValue();
      if (value == null) {
        return true;
      }
      return value.matcher(resourceValue).matches();
    };
  }

  public void evictCache() {
    cachedUsers.invalidateAll();
  }

  public void reloadRoles() {
    init();
    evictCache();
  }

  public boolean isRbacEnabled() {
    return rbacEnabled;
  }
}
