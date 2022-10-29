package com.provectus.kafka.ui.model.rbac;

import static lombok.AccessLevel.PRIVATE;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.regex.Pattern;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;
import lombok.extern.jackson.Jacksonized;
import org.springframework.util.Assert;

@Getter
@Setter
@ToString
@Jacksonized
@FieldDefaults(level = PRIVATE, makeFinal = true)
@EqualsAndHashCode
public class Permission {

  String resource;
  String name; // TODO resourceName?Value?
  List<String> actions;

  @JsonIgnore
  Pattern namePattern;

  @JsonCreator
  public Permission(@JsonProperty("resource") String resource,
                    @JsonProperty("name") String name,
                    @JsonProperty("actions") List<String> actions) {
    Assert.notNull(name, "permission value is empty");
    this.resource = resource;
    this.name = name;
    this.actions = actions;
    this.namePattern = Pattern.compile(name);
  }

}
