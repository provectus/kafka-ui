package com.provectus.kafka.ui.base;

import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.connector.ConnectorCreateView;
import com.provectus.kafka.ui.pages.connector.ConnectorsList;
import com.provectus.kafka.ui.pages.connector.ConnectorsView;
import com.provectus.kafka.ui.pages.schema.SchemaCreateView;
import com.provectus.kafka.ui.pages.schema.SchemaEditView;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.schema.SchemaView;
import com.provectus.kafka.ui.pages.topic.ProduceMessagePanel;
import com.provectus.kafka.ui.pages.topic.TopicCreateEditSettingsView;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.pages.topic.TopicsList;

public abstract class Facade {
    protected MainPage mainPage = new MainPage();
    protected ApiHelper apiHelper = new ApiHelper();
    protected ConnectorCreateView connectorCreateView = new ConnectorCreateView();
    protected ConnectorsList connectorsList = new ConnectorsList();
    protected ConnectorsView connectorsView = new ConnectorsView();
    protected SchemaCreateView schemaCreateView = new SchemaCreateView();
    protected SchemaEditView schemaEditView = new SchemaEditView();
    protected SchemaView schemaView = new SchemaView();
    protected SchemaRegistryList schemaRegistryList = new SchemaRegistryList();
    protected ProduceMessagePanel produceMessagePanel = new ProduceMessagePanel();
    protected TopicCreateEditSettingsView topicCreateEditSettingsView = new TopicCreateEditSettingsView();
    protected TopicsList topicsList = new TopicsList();
    protected TopicView topicView = new TopicView();
}
