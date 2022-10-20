package com.provectus.kafka.ui.model.rbac;

import java.util.List;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class Permission {

  String resource;
  String name; // TODO resourceName?Value?
  List<String> actions;


}
