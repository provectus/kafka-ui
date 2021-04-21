package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.connect.model.ConnectorStatusConnector;
import com.provectus.kafka.ui.connect.model.ConnectorTask;
import com.provectus.kafka.ui.connect.model.NewConnector;
import com.provectus.kafka.ui.model.Connector;
import com.provectus.kafka.ui.model.ConnectorPlugin;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponse;
import com.provectus.kafka.ui.model.ConnectorStatus;
import com.provectus.kafka.ui.model.ConnectorTaskStatus;
import com.provectus.kafka.ui.model.FullConnectorInfo;
import com.provectus.kafka.ui.model.Task;
import com.provectus.kafka.ui.model.TaskStatus;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.apache.commons.lang3.tuple.Triple;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface KafkaConnectMapper {
  NewConnector toClient(com.provectus.kafka.ui.model.NewConnector newConnector);

  Connector fromClient(com.provectus.kafka.ui.connect.model.Connector connector);

  ConnectorStatus fromClient(ConnectorStatusConnector connectorStatus);

  Task fromClient(ConnectorTask connectorTask);

  TaskStatus fromClient(com.provectus.kafka.ui.connect.model.TaskStatus taskStatus);

  ConnectorPlugin fromClient(com.provectus.kafka.ui.connect.model.ConnectorPlugin connectorPlugin);

  ConnectorPluginConfigValidationResponse fromClient(
      com.provectus.kafka.ui.connect.model.ConnectorPluginConfigValidationResponse
          connectorPluginConfigValidationResponse);

  default FullConnectorInfo fullConnectorInfoFromTuple(Triple<Connector, Map<String, Object>,
      List<Task>> triple) {
    Function<Map<String, Object>, List<String>> getTopicsFromConfig = config -> {
      var topic = config.get("topic");
      if (topic != null) {
        return List.of((String) topic);
      }
      return Arrays.asList(((String) config.get("topics")).split(","));
    };

    return new FullConnectorInfo()
        .connect(triple.getLeft().getConnect())
        .name(triple.getLeft().getName())
        .connectorClass((String) triple.getMiddle().get("connector.class"))
        .type(triple.getLeft().getType())
        .topics(getTopicsFromConfig.apply(triple.getMiddle()))
        .status(
            triple.getLeft().getStatus().getState()
        )
        .tasksCount(triple.getRight().size())
        .failedTasksCount((int) triple.getRight().stream()
            .map(Task::getStatus)
            .map(TaskStatus::getState)
            .filter(ConnectorTaskStatus.FAILED::equals)
            .count());
  }

  ;
}
