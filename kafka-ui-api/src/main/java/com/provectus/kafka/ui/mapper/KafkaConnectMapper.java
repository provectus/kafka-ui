package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.connect.model.ConnectorStatusConnector;
import com.provectus.kafka.ui.connect.model.ConnectorTask;
import com.provectus.kafka.ui.connect.model.NewConnector;
import com.provectus.kafka.ui.model.ConnectorDTO;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponseDTO;
import com.provectus.kafka.ui.model.ConnectorPluginDTO;
import com.provectus.kafka.ui.model.ConnectorStatusDTO;
import com.provectus.kafka.ui.model.ConnectorTaskStatusDTO;
import com.provectus.kafka.ui.model.FullConnectorInfoDTO;
import com.provectus.kafka.ui.model.TaskDTO;
import com.provectus.kafka.ui.model.TaskStatusDTO;
import com.provectus.kafka.ui.model.connect.InternalConnectInfo;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface KafkaConnectMapper {
  NewConnector toClient(com.provectus.kafka.ui.model.NewConnectorDTO newConnector);

  ConnectorDTO fromClient(com.provectus.kafka.ui.connect.model.Connector connector);

  ConnectorStatusDTO fromClient(ConnectorStatusConnector connectorStatus);

  TaskDTO fromClient(ConnectorTask connectorTask);

  TaskStatusDTO fromClient(com.provectus.kafka.ui.connect.model.TaskStatus taskStatus);

  ConnectorPluginDTO fromClient(
      com.provectus.kafka.ui.connect.model.ConnectorPlugin connectorPlugin);

  ConnectorPluginConfigValidationResponseDTO fromClient(
      com.provectus.kafka.ui.connect.model.ConnectorPluginConfigValidationResponse
          connectorPluginConfigValidationResponse);

  default FullConnectorInfoDTO fullConnectorInfo(InternalConnectInfo connectInfo) {
    ConnectorDTO connector = connectInfo.getConnector();
    List<TaskDTO> tasks = connectInfo.getTasks();
    int failedTasksCount = (int) tasks.stream()
        .map(TaskDTO::getStatus)
        .map(TaskStatusDTO::getState)
        .filter(ConnectorTaskStatusDTO.FAILED::equals)
        .count();
    return new FullConnectorInfoDTO()
        .connect(connector.getConnect())
        .name(connector.getName())
        .connectorClass((String) connectInfo.getConfig().get("connector.class"))
        .type(connector.getType())
        .topics(connectInfo.getTopics())
        .status(connector.getStatus())
        .tasksCount(tasks.size())
        .failedTasksCount(failedTasksCount);
  }
}
