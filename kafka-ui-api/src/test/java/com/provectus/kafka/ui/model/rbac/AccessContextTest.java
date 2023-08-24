package com.provectus.kafka.ui.model.rbac;


import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.model.rbac.AccessContext.ResourceAccess;
import com.provectus.kafka.ui.model.rbac.AccessContext.SingleResourceAccess;
import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import jakarta.annotation.Nullable;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class AccessContextTest {

  @Test
  void validateReturnsTrueIfAllResourcesAreAccessible() {
    ResourceAccess okResourceAccess1 = mock(ResourceAccess.class);
    when(okResourceAccess1.isAccessible(any())).thenReturn(true);

    ResourceAccess okResourceAccess2 = mock(ResourceAccess.class);
    when(okResourceAccess2.isAccessible(any())).thenReturn(true);

    var cxt = new AccessContext("cluster", List.of(okResourceAccess1, okResourceAccess2), "op", "params");
    assertThat(cxt.isAccessible(List.of())).isTrue();
  }

  @Test
  void validateReturnsFalseIfAnyResourcesCantBeAccessible() {
    ResourceAccess okResourceAccess = mock(ResourceAccess.class);
    when(okResourceAccess.isAccessible(any())).thenReturn(true);

    ResourceAccess failureResourceAccess = mock(ResourceAccess.class);
    when(failureResourceAccess.isAccessible(any())).thenReturn(false);

    var cxt = new AccessContext("cluster", List.of(okResourceAccess, failureResourceAccess), "op", "params");
    assertThat(cxt.isAccessible(List.of())).isFalse();
  }


  @Nested
  class SingleResourceAccessTest {

    @Test
    void allowsAccessForResourceWithNameIfUserHasAllNeededPermissions() {
      SingleResourceAccess sra =
          new SingleResourceAccess("test_topic123", Resource.TOPIC, List.of(TopicAction.VIEW, TopicAction.EDIT));

      var allowed = sra.isAccessible(
          List.of(
              permission(Resource.TOPIC, "test_topic.*", TopicAction.EDIT),
              permission(Resource.TOPIC, "test.*", TopicAction.VIEW)));

      assertThat(allowed).isTrue();
    }

    @Test
    void deniesAccessForResourceWithNameIfUserHasSomePermissionsMissing() {
      SingleResourceAccess sra =
          new SingleResourceAccess("test_topic123", Resource.TOPIC,
              List.of(TopicAction.VIEW, TopicAction.MESSAGES_DELETE));

      var allowed = sra.isAccessible(
          List.of(
              permission(Resource.TOPIC, "test_topic.*", TopicAction.EDIT),
              permission(Resource.TOPIC, "test.*", TopicAction.VIEW)));

      assertThat(allowed).isFalse();
    }

    @Test
    void allowsAccessForResourceWithoutNameIfUserHasAllNeededPermissions() {
      SingleResourceAccess sra =
          new SingleResourceAccess(Resource.CLUSTERCONFIG, List.of(ClusterConfigAction.VIEW));

      var allowed = sra.isAccessible(
          List.of(
              permission(Resource.CLUSTERCONFIG, null, ClusterConfigAction.VIEW, ClusterConfigAction.EDIT)));

      assertThat(allowed).isTrue();
    }

    @Test
    void deniesAccessForResourceWithoutNameIfUserHasAllNeededPermissions() {
      SingleResourceAccess sra =
          new SingleResourceAccess(Resource.CLUSTERCONFIG, List.of(ClusterConfigAction.EDIT));

      var allowed = sra.isAccessible(
          List.of(
              permission(Resource.CLUSTERCONFIG, null, ClusterConfigAction.VIEW)));

      assertThat(allowed).isFalse();
    }

    private Permission permission(Resource res, @Nullable String namePattern, PermissibleAction... actions) {
      Permission p = new Permission();
      p.setResource(res.name());
      p.setActions(Stream.of(actions).map(PermissibleAction::name).toList());
      p.setValue(namePattern);
      p.validate();
      p.transform();
      return p;
    }
  }

}
