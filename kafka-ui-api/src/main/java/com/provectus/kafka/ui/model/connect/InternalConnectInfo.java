package com.provectus.kafka.ui.model.connect;

import com.provectus.kafka.ui.model.Connector;
import com.provectus.kafka.ui.model.Task;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalConnectInfo {
  private final Connector connector;
  private final Map<String, Object> config;
  private final List<Task> tasks;
  private final List<String> topics;
}
