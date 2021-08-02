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
import com.provectus.kafka.ui.model.connect.InternalConnectInfo;
import java.util.List;
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

  default FullConnectorInfo fullConnectorInfoFromTuple(InternalConnectInfo connectInfo) {
    Connector connector = connectInfo.getConnector();
    List<Task> tasks = connectInfo.getTasks();
    int failedTasksCount = (int) tasks.stream()
        .map(Task::getStatus)
        .map(TaskStatus::getState)
        .filter(ConnectorTaskStatus.FAILED::equals)
        .count();
    return new FullConnectorInfo()
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
