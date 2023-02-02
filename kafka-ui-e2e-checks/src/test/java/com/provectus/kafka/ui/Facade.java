package com.provectus.kafka.ui;

import com.provectus.kafka.ui.pages.NaviSideBar;
import com.provectus.kafka.ui.pages.TopPanel;
import com.provectus.kafka.ui.pages.broker.BrokersConfigTab;
import com.provectus.kafka.ui.pages.broker.BrokersDetails;
import com.provectus.kafka.ui.pages.broker.BrokersList;
import com.provectus.kafka.ui.pages.connector.ConnectorCreateForm;
import com.provectus.kafka.ui.pages.connector.ConnectorDetails;
import com.provectus.kafka.ui.pages.connector.KafkaConnectList;
import com.provectus.kafka.ui.pages.consumer.ConsumersDetails;
import com.provectus.kafka.ui.pages.consumer.ConsumersList;
import com.provectus.kafka.ui.pages.ksqlDb.KsqlDbList;
import com.provectus.kafka.ui.pages.ksqlDb.KsqlQueryForm;
import com.provectus.kafka.ui.pages.schema.SchemaCreateForm;
import com.provectus.kafka.ui.pages.schema.SchemaDetails;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.topic.*;
import com.provectus.kafka.ui.services.ApiService;

public abstract class Facade {
    protected ApiService apiService = new ApiService();
    protected ConnectorCreateForm connectorCreateForm = new ConnectorCreateForm();
    protected KafkaConnectList kafkaConnectList = new KafkaConnectList();
    protected ConnectorDetails connectorDetails = new ConnectorDetails();
    protected SchemaCreateForm schemaCreateForm = new SchemaCreateForm();
    protected SchemaDetails schemaDetails = new SchemaDetails();
    protected SchemaRegistryList schemaRegistryList = new SchemaRegistryList();
    protected ProduceMessagePanel produceMessagePanel = new ProduceMessagePanel();
    protected TopicCreateEditForm topicCreateEditForm = new TopicCreateEditForm();
    protected TopicsList topicsList = new TopicsList();
    protected TopicDetails topicDetails = new TopicDetails();
    protected ConsumersDetails consumersDetails = new ConsumersDetails();
    protected ConsumersList consumersList = new ConsumersList();
    protected NaviSideBar naviSideBar = new NaviSideBar();
    protected TopPanel topPanel = new TopPanel();
    protected BrokersList brokersList = new BrokersList();
    protected BrokersDetails brokersDetails = new BrokersDetails();
    protected BrokersConfigTab brokersConfigTab = new BrokersConfigTab();
    protected TopicSettingsTab topicSettingsTab = new TopicSettingsTab();
    protected KsqlQueryForm ksqlQueryForm = new KsqlQueryForm();
    protected KsqlDbList ksqlDbList = new KsqlDbList();
}
