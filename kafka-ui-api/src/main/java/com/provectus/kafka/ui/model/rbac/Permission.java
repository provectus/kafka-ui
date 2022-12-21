package com.provectus.kafka.ui.model.rbac;

import static com.provectus.kafka.ui.model.rbac.Resource.CLUSTERCONFIG;
import static com.provectus.kafka.ui.model.rbac.Resource.KSQL;

import com.provectus.kafka.ui.model.rbac.permission.ClusterConfigAction;
import com.provectus.kafka.ui.model.rbac.permission.ConnectAction;
import com.provectus.kafka.ui.model.rbac.permission.ConsumerGroupAction;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.model.rbac.permission.SchemaAction;
import com.provectus.kafka.ui.model.rbac.permission.TopicAction;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import org.jetbrains.annotations.Nullable;
import org.springframework.util.Assert;

@Getter
@ToString
@EqualsAndHashCode
public class Permission {

  Resource resource;

  @Nullable
  Pattern value;
  List<String> actions;

  @SuppressWarnings("unused")
  public void setResource(String resource) {
    this.resource = Resource.fromString(resource.toUpperCase());
  }

  public void setValue(String value) {
    this.value = Pattern.compile(value);
  }

  @SuppressWarnings("unused")
  public void setActions(List<String> actions) {
    this.actions = actions;
  }

  public void validate() {
    Assert.notNull(resource, "resource cannot be null");
    if (!List.of(KSQL, CLUSTERCONFIG).contains(this.resource)) {
      Assert.notNull(value, "permission value can't be empty for resource " + resource);
    }
  }

  public void transform() {
    if (!this.actions.contains("ALL")) {
      return;
    }
    this.actions = getActionValues();
  }

  private List<String> getActionValues() {
    return switch (this.resource) {
      case CLUSTERCONFIG -> Arrays.stream(ClusterConfigAction.values()).map(Enum::toString).toList();
      case TOPIC -> Arrays.stream(TopicAction.values()).map(Enum::toString).toList();
      case CONSUMER -> Arrays.stream(ConsumerGroupAction.values()).map(Enum::toString).toList();
      case SCHEMA -> Arrays.stream(SchemaAction.values()).map(Enum::toString).toList();
      case CONNECT -> Arrays.stream(ConnectAction.values()).map(Enum::toString).toList();
      case KSQL -> Arrays.stream(KsqlAction.values()).map(Enum::toString).toList();
    };
  }

}
