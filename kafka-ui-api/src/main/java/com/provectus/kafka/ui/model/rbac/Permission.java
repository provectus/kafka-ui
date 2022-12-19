package com.provectus.kafka.ui.model.rbac;

import static com.provectus.kafka.ui.model.rbac.Resource.CLUSTERCONFIG;
import static com.provectus.kafka.ui.model.rbac.Resource.KSQL;

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
    if (this.resource != null && !List.of(KSQL, CLUSTERCONFIG).contains(this.resource)) {
      Assert.notNull(value, "permission value can't be empty for resource " + resource);
    }
  }

}
