package com.provectus.kafka.ui;

import io.qameta.allure.Issue;
import lombok.SneakyThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class SmokeTests extends com.provectus.kafka.ui.base.Test {
    @Test
    @SneakyThrows
    @DisplayName("main page should load")
    @Issue("380")
    void mainPageLoads() {
        pages.open()
                .isOnPage();
        compareScreenshots("main");
    }

}
