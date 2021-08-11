package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import lombok.SneakyThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.provectus.kafka.ui.topics.TopicTests.SECOND_LOCAL;

public class ConnectorsTests extends BaseTest {

    @SneakyThrows
    @DisplayName("should create a connector")
    @Test
    void createConnector() {
        pages.openConnectorsList(SECOND_LOCAL)
                .isOnPage()
                .clickCreateConnectorButton();
    }
}
