package com.provectus.kafka.ui.topics;

import com.provectus.kafka.ui.base.BaseTest;
import lombok.SneakyThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class ConnectorsTests extends BaseTest {

    @SneakyThrows
    @DisplayName("should create a connector")
    @Test
    void createTopic() {
        pages.openConnectorsList("secondLocal")
                .isOnPage();

    }
}
