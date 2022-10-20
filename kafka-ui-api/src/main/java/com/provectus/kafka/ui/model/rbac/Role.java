package com.provectus.kafka.ui.model.rbac;

import java.util.List;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class Role {

  String name;
  List<String> clusters;
  List<Subject> subjects;
  List<Permission> permissions;
}
