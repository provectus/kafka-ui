package com.provectus.kafka.ui.model.rbac;

import com.provectus.kafka.ui.model.rbac.provider.Provider;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class Subject {

  Provider provider;
  String type;
  String value;

}
