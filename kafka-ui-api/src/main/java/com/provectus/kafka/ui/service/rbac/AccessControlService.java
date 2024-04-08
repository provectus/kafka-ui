package com.provectus.kafka.ui.service.rbac;

import static com.provectus.kafka.ui.model.rbac.Resource.APPLICATIONCONFIG;

import com.provectus.kafka.ui.config.auth.AuthenticatedUser;
import com.provectus.kafka.ui.config.auth.RbacUser;
import com.provectus.kafka.ui.config.auth.RoleBasedAccessControlProperties;
import com.provectus.kafka.ui.model.ClusterDTO;
import com.provectus.kafka.ui.model.ConnectDTO;
import com.provectus.kafka.ui.model.InternalTopic;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.Permission;
import com.provectus.kafka.ui.model.rbac.Resource;
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
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
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
  private static final String ACTIONS_ARE_EMPTY = "actions are empty";

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

    if (CollectionUtils.isNotEmpty(context.getApplicationConfigActions())) {
      return getUser()
          .doOnNext(user -> {
            boolean accessGranted = isApplicationConfigAccessible(context, user);

            if (!accessGranted) {
              throw new AccessDeniedException(ACCESS_DENIED);
            }
          }).then();
    }

    return getUser()
        .doOnNext(user -> {
          boolean accessGranted =
              isApplicationConfigAccessible(context, user)
                  && isClusterAccessible(context, user)
                  && isClusterConfigAccessible(context, user)
                  && isTopicAccessible(context, user)
                  && isConsumerGroupAccessible(context, user)
                  && isConnectAccessible(context, user)
                  && isConnectorAccessible(context, user) // TODO connector selectors
                  && isSchemaAccessible(context, user)
                  && isKsqlAccessible(context, user)
                  && isAclAccessible(context, user)
                  && isAuditAccessible(context, user);

          if (!accessGranted) {
            throw new AccessDeniedException(ACCESS_DENIED);
          }
        })
        .then();
  }

  public Mono<AuthenticatedUser> getUser() {
    return ReactiveSecurityContextHolder.getContext()
        .map(SecurityContext::getAuthentication)
        .filter(authentication -> authentication.getPrincipal() instanceof RbacUser)
        .map(authentication -> ((RbacUser) authentication.getPrincipal()))
        .map(user -> new AuthenticatedUser(user.name(), user.groups()));
  }

  public boolean isApplicationConfigAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }
    if (CollectionUtils.isEmpty(context.getApplicationConfigActions())) {
      return true;
    }
    Set<String> requiredActions = context.getApplicationConfigActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());
    return isAccessible(APPLICATIONCONFIG, null, user, context, requiredActions);
  }

  private boolean isClusterAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    Assert.isTrue(StringUtils.isNotEmpty(context.getCluster()), "cluster value is empty");

    return properties.getRoles()
        .stream()
        .filter(filterRole(user))
        .anyMatch(filterCluster(context.getCluster()));
  }

  public Mono<Boolean> isClusterAccessible(ClusterDTO cluster) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(cluster.getName())
        .build();

    return getUser().map(u -> isClusterAccessible(accessContext, u));
  }

  public boolean isClusterConfigAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

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
    if (!rbacEnabled) {
      return true;
    }

    if (context.getTopic() == null && context.getTopicActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getTopicActions().isEmpty(), ACTIONS_ARE_EMPTY);

    Set<String> requiredActions = context.getTopicActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.TOPIC, context.getTopic(), user, context, requiredActions);
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
                      .topic(topic.getName())
                      .topicActions(TopicAction.VIEW)
                      .build();
                  return isTopicAccessible(accessContext, user);
                }
            ).toList());
  }

  private boolean isConsumerGroupAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    if (context.getConsumerGroup() == null && context.getConsumerGroupActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getConsumerGroupActions().isEmpty(), ACTIONS_ARE_EMPTY);

    Set<String> requiredActions = context.getConsumerGroupActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.CONSUMER, context.getConsumerGroup(), user, context, requiredActions);
  }

  public Mono<Boolean> isConsumerGroupAccessible(String groupId, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .consumerGroup(groupId)
        .consumerGroupActions(ConsumerGroupAction.VIEW)
        .build();

    return getUser().map(u -> isConsumerGroupAccessible(accessContext, u));
  }

  public boolean isSchemaAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    if (context.getSchema() == null && context.getSchemaActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getSchemaActions().isEmpty(), ACTIONS_ARE_EMPTY);

    Set<String> requiredActions = context.getSchemaActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.SCHEMA, context.getSchema(), user, context, requiredActions);
  }

  public Mono<Boolean> isSchemaAccessible(String schema, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .schema(schema)
        .schemaActions(SchemaAction.VIEW)
        .build();

    return getUser().map(u -> isSchemaAccessible(accessContext, u));
  }

  public boolean isConnectAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    if (context.getConnect() == null && context.getConnectActions().isEmpty()) {
      return true;
    }
    Assert.isTrue(!context.getConnectActions().isEmpty(), ACTIONS_ARE_EMPTY);

    Set<String> requiredActions = context.getConnectActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.CONNECT, context.getConnect(), user, context, requiredActions);
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
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .build();

    return getUser().map(u -> isConnectAccessible(accessContext, u));
  }

  public boolean isConnectorAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    return isConnectAccessible(context, user);
  }

  public Mono<Boolean> isConnectorAccessible(String connectName, String connectorName, String clusterName) {
    if (!rbacEnabled) {
      return Mono.just(true);
    }

    AccessContext accessContext = AccessContext
        .builder()
        .cluster(clusterName)
        .connect(connectName)
        .connectActions(ConnectAction.VIEW)
        .connector(connectorName)
        .build();

    return getUser().map(u -> isConnectorAccessible(accessContext, u));
  }

  private boolean isKsqlAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    if (context.getKsqlActions().isEmpty()) {
      return true;
    }

    Set<String> requiredActions = context.getKsqlActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.KSQL, null, user, context, requiredActions);
  }

  private boolean isAclAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    if (context.getAclActions().isEmpty()) {
      return true;
    }

    Set<String> requiredActions = context.getAclActions()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.ACL, null, user, context, requiredActions);
  }

  private boolean isAuditAccessible(AccessContext context, AuthenticatedUser user) {
    if (!rbacEnabled) {
      return true;
    }

    if (context.getAuditAction().isEmpty()) {
      return true;
    }

    Set<String> requiredActions = context.getAuditAction()
        .stream()
        .map(a -> a.toString().toUpperCase())
        .collect(Collectors.toSet());

    return isAccessible(Resource.AUDIT, null, user, context, requiredActions);
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

  private boolean isAccessible(Resource resource, @Nullable String resourceValue,
                               AuthenticatedUser user, AccessContext context, Set<String> requiredActions) {
    Set<String> grantedActions = properties.getRoles()
        .stream()
        .filter(filterRole(user))
        .filter(filterCluster(resource, context.getCluster()))
        .flatMap(grantedRole -> grantedRole.getPermissions().stream())
        .filter(filterResource(resource))
        .filter(filterResourceValue(resourceValue))
        .flatMap(grantedPermission -> grantedPermission.getActions().stream())
        .map(String::toUpperCase)
        .collect(Collectors.toSet());

    return grantedActions.containsAll(requiredActions);
  }

  private Predicate<Role> filterRole(AuthenticatedUser user) {
    return role -> user.groups().contains(role.getName());
  }

  private Predicate<Role> filterCluster(String cluster) {
    return grantedRole -> grantedRole.getClusters()
        .stream()
        .anyMatch(cluster::equalsIgnoreCase);
  }

  private Predicate<Role> filterCluster(Resource resource, String cluster) {
    if (resource == APPLICATIONCONFIG) {
      return role -> true;
    }
    return filterCluster(cluster);
  }

  private Predicate<Permission> filterResource(Resource resource) {
    return grantedPermission -> resource == grantedPermission.getResource();
  }

  private Predicate<Permission> filterResourceValue(@Nullable String resourceValue) {

    if (resourceValue == null) {
      return grantedPermission -> true;
    }
    return grantedPermission -> {
      Pattern valuePattern = grantedPermission.getCompiledValuePattern();
      if (valuePattern == null) {
        return true;
      }
      return valuePattern.matcher(resourceValue).matches();
    };
  }

  public boolean isRbacEnabled() {
    return rbacEnabled;
  }
}
