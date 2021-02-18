package com.provectus.kafka.ui.cluster.mapper;

import com.provectus.kafka.ui.connect.model.NewConnector;
import com.provectus.kafka.ui.model.Connector;
import com.provectus.kafka.ui.model.ConnectorPlugin;
import com.provectus.kafka.ui.model.ConnectorPluginConfigValidationResponse;
import com.provectus.kafka.ui.model.ConnectorTask;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface KafkaConnectMapper {
    NewConnector toClientNewConnector(com.provectus.kafka.ui.model.NewConnector newConnector);

    Connector fromClientConnector(com.provectus.kafka.ui.connect.model.Connector connector);

    ConnectorTask fromClientConnectorTask(com.provectus.kafka.ui.connect.model.ConnectorTask connectorTask);

    ConnectorPlugin fromClientConnectorPlugin(com.provectus.kafka.ui.connect.model.ConnectorPlugin connectorPlugin);

    ConnectorPluginConfigValidationResponse fromClient(com.provectus.kafka.ui.connect.model.ConnectorPluginConfigValidationResponse connectorPluginConfigValidationResponse);
}
