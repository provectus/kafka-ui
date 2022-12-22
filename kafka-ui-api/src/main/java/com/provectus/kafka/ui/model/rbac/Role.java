package com.provectus.kafka.ui.model.rbac;

import java.util.List;
import lombok.Data;

@Data
public class Role {

  String name;
  List<String> clusters;
  List<Subject> subjects;
  List<Permission> permissions;

  public void validate() {
    permissions.forEach(Permission::transform);
    permissions.forEach(Permission::validate);
  }

}
