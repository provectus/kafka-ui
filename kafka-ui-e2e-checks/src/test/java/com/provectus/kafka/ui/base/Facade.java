package com.provectus.kafka.ui.base;

import com.provectus.kafka.ui.helpers.ApiHelper;
import com.provectus.kafka.ui.pages.MainPage;
import com.provectus.kafka.ui.pages.connector.ConnectorsList;
import com.provectus.kafka.ui.pages.connector.ConnectorsView;
import com.provectus.kafka.ui.pages.schema.SchemaRegistryList;
import com.provectus.kafka.ui.pages.topic.TopicView;
import com.provectus.kafka.ui.pages.topic.TopicsList;

public abstract class Facade {

    protected ConnectorsView connectorsView = new ConnectorsView();
    protected MainPage mainPage = new MainPage();
    protected TopicsList topicsList = new TopicsList();
    protected TopicView topicView = new TopicView();
    protected ConnectorsList connectorsList = new ConnectorsList();
    protected SchemaRegistryList schemaRegistry = new SchemaRegistryList();
    protected ApiHelper apiHelpers = new ApiHelper();
}
