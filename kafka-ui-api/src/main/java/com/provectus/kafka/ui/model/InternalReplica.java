package com.provectus.kafka.ui.model;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@RequiredArgsConstructor
public class InternalReplica {
  private final int broker;
  private final boolean leader;
  private final boolean inSync;
}
