package com.provectus.kafka.ui.model.rbac;

import static org.apache.commons.collections.CollectionUtils.isNotEmpty;

import com.google.common.base.Preconditions;
import com.provectus.kafka.ui.model.rbac.permission.PermissibleAction;
import java.util.List;
import java.util.regex.Pattern;
import javax.annotation.Nullable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@EqualsAndHashCode
public class Permission {

  Resource resource;

  List<String> actions;
  transient List<PermissibleAction> parsedActions; //includes all dependant actions

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
    Preconditions.checkNotNull(resource, "resource cannot be null");
    Preconditions.checkArgument(isNotEmpty(actions), "Actions list for %s can't be null or empty", resource);
  }

  public void transform() {
    if (value != null) {
      this.compiledValuePattern = Pattern.compile(value);
    }
    if (actions.stream().anyMatch("ALL"::equalsIgnoreCase)) {
      this.parsedActions = resource.allActions();
    } else {
      this.parsedActions = resource.parseActionsWithDependantsUnnest(actions);
    }
  }

}
