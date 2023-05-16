package com.provectus.kafka.ui;

import com.provectus.kafka.ui.pages.brokers.BrokersConfigTab;
import com.provectus.kafka.ui.pages.brokers.BrokersDetails;
import com.provectus.kafka.ui.pages.brokers.BrokersList;
import com.provectus.kafka.ui.pages.connectors.ConnectorCreateForm;
import com.provectus.kafka.ui.pages.connectors.ConnectorDetails;
import com.provectus.kafka.ui.pages.connectors.KafkaConnectList;
import com.provectus.kafka.ui.pages.consumers.ConsumersDetails;
import com.provectus.kafka.ui.pages.consumers.ConsumersList;
import com.provectus.kafka.ui.pages.ksqldb.KsqlDbList;
import com.provectus.kafka.ui.pages.ksqldb.KsqlQueryForm;
import com.provectus.kafka.ui.pages.panels.NaviSideBar;
import com.provectus.kafka.ui.pages.panels.TopPanel;
import com.provectus.kafka.ui.pages.schemas.SchemaCreateForm;
import com.provectus.kafka.ui.pages.schemas.SchemaDetails;
import com.provectus.kafka.ui.pages.schemas.SchemaRegistryList;
import com.provectus.kafka.ui.pages.topics.ProduceMessagePanel;
import com.provectus.kafka.ui.pages.topics.TopicCreateEditForm;
import com.provectus.kafka.ui.pages.topics.TopicDetails;
import com.provectus.kafka.ui.pages.topics.TopicSettingsTab;
import com.provectus.kafka.ui.pages.topics.TopicsList;
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
