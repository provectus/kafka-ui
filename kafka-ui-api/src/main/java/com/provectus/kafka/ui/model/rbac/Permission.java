package com.provectus.kafka.ui.model.rbac;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import java.util.List;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.util.Assert;

@Getter
@ToString
@EqualsAndHashCode
public class Permission {

  Resource resource;

  List<String> actions;
  transient List<PermissibleAction> parsedActions;

  @Nullable
  String value;
  @Nullable
  transient Pattern compiledValuePattern;

  @SuppressWarnings("unused")
  public void setResource(String resource) {
    this.resource = Resource.fromString(resource.toUpperCase());
  }

  @SuppressWarnings("unused")
  public void setValue(@Nullable String value) {
    this.value = value;
  }

  @SuppressWarnings("unused")
  public void setActions(List<String> actions) {
    this.actions = actions;
  }

  public void validate() {
    Assert.notNull(resource, "resource cannot be null");
  }

  public void transform() {
    if (value != null) {
      this.compiledValuePattern = Pattern.compile(value);
    }
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(actions), "Actions list can't be null or empty list");
    if (actions.stream().anyMatch("ALL"::equalsIgnoreCase)) {
      this.parsedActions = resource.allActions();
    } else {
      this.parsedActions = resource.parseActions(actions);
    }
  }

}
