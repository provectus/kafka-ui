package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import lombok.SneakyThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.provectus.kafka.ui.topics.TopicTests.SECOND_LOCAL;

public class ConnectorsTests extends BaseTest {

    public static final String SOURCE_CONNECTOR = "source_postgres_activities";

    @SneakyThrows
    @DisplayName("should create a connector")
    @Test
    void createConnector() {
        pages.openConnectorsList(SECOND_LOCAL)
                .isOnPage()
                .clickCreateConnectorButton();
    }
    //tbd
    @SneakyThrows
    @DisplayName("should update a connector")
    @Test
    void updateConnector() {
        pages.openConnectorsList(SECOND_LOCAL)
                .isOnPage()
                .openConnector(SOURCE_CONNECTOR);
        pages.openConnectorsView(SECOND_LOCAL,SOURCE_CONNECTOR)
                .openEditConfig();
    }

    @SneakyThrows
    @DisplayName("should delete connector")
    @Test
    void deleteConnector() {
        pages.openConnectorsList(SECOND_LOCAL)
                .isOnPage()
                .openConnector(SOURCE_CONNECTOR);
        pages.openConnectorsView(SECOND_LOCAL,SOURCE_CONNECTOR)
                .clickDeleteButton();
        pages.openConnectorsList(SECOND_LOCAL).isNotVisible(SOURCE_CONNECTOR);
    }
}
