package com.provectus.kafka.ui.model.connect;

import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class InternalConnectInfo {
  private final ConnectorDTO connector;
  private final Map<String, Object> config;
  private final List<TaskDTO> tasks;
  private final List<String> topics;
}
