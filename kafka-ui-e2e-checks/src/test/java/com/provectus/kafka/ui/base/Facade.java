package com.provectus.kafka.ui.base;

import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.pages.NaviSideBar;
import com.provectus.kafka.ui.pages.TopPanel;
import com.provectus.kafka.ui.pages.brokers.BrokersConfigTabPanel;
import com.provectus.kafka.ui.pages.brokers.BrokersDetails;
import com.provectus.kafka.ui.pages.brokers.BrokersList;
import com.provectus.kafka.ui.pages.connector.ConnectorCreateForm;
import com.provectus.kafka.ui.pages.connector.ConnectorDetails;
import com.provectus.kafka.ui.pages.connector.KafkaConnectList;
import com.provectus.kafka.ui.pages.consumer.ConsumersDetails;
import com.provectus.kafka.ui.pages.consumer.ConsumersList;
import com.provectus.kafka.ui.pages.schema.SchemaCreateForm;
import com.provectus.kafka.ui.pages.schema.SchemaDetails;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.topic.ProduceMessagePanel;
import com.provectus.kafka.ui.pages.topic.TopicCreateEditForm;
import com.provectus.kafka.ui.pages.topic.TopicDetails;
import com.provectus.kafka.ui.pages.topic.TopicsList;

public abstract class Facade {
    protected ApiHelper apiHelper = new ApiHelper();
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
    protected BrokersConfigTabPanel brokersConfigTabPanel = new BrokersConfigTabPanel();
}
