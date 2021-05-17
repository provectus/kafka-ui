package com.provectus.kafka.ui;

import com.provectus.kafka.ui.base.BaseTest;
import io.qameta.allure.Issue;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class SmokeTests extends BaseTest {
    @SneakyThrows
    @Test
    @DisplayName("main page should load")
    @Issue("380")
    public void mainPageLoads() {
        pages.goTo("")
            .mainPage.shouldBeOnPage();
        compareScreenshots("main");
    }

}
