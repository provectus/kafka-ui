package com.provectus.kafka.ui.model.rbac;

import static com.provectus.kafka.ui.model.rbac.Resource.CLUSTERCONFIG;
import static com.provectus.kafka.ui.model.rbac.Resource.KSQL;
import static lombok.AccessLevel.PRIVATE;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.regex.Pattern;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;
import lombok.extern.jackson.Jacksonized;
import org.jetbrains.annotations.Nullable;
import org.springframework.util.Assert;

@Getter
@Setter
@ToString
@Jacksonized
@FieldDefaults(level = PRIVATE, makeFinal = true)
@EqualsAndHashCode
public class Permission {

  Resource resource;

  @Nullable
  Pattern value;
  List<String> actions;

  @JsonCreator
  public Permission(@JsonProperty("resource") String resource,
                    @JsonProperty("value") @Nullable String value,
                    @JsonProperty("actions") List<String> actions) {

    this.resource = Resource.valueOf(resource.toUpperCase());

    if (!List.of(KSQL, CLUSTERCONFIG).contains(this.resource)) {
      Assert.notNull(value, "permission value can't be empty for resource " + resource);
    }

    this.actions = actions;
    this.value = value != null ? Pattern.compile(value) : null;
  }

}
