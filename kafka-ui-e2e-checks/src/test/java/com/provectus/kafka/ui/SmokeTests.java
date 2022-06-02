package com.provectus.kafka.ui;

import com.provectus.kafka.ui.base.BaseTest;
import lombok.SneakyThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {
    @Test
    @SneakyThrows
    @DisplayName("main page should load")
    void mainPageLoads() {
        pages.open()
                .isOnPage();
        compareScreenshots("main");
    }

}
