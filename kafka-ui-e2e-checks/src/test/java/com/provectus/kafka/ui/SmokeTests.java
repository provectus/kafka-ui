package com.provectus.kafka.ui;

import com.provectus.kafka.ui.base.BaseTest;
import io.qameta.allure.Issue;
import lombok.SneakyThrows;
import org.junit.Ignore;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@Disabled // TODO #1480
public class SmokeTests extends BaseTest {
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
