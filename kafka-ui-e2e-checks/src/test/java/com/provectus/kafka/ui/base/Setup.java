package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.logevents.SelenideLogger;
import io.qameta.allure.Step;
import io.qameta.allure.selenide.AllureSelenide;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.util.Arrays;

import static com.codeborne.selenide.Selenide.*;

@Slf4j
public abstract class Setup {

    @SneakyThrows
    static void setup() {
        Configuration.reportsFolder = Config.REPORTS_FOLDER;
        Configuration.screenshots = Config.SCREENSHOTS;
        Configuration.savePageSource = Config.SAVE_PAGE_SOURCE;
        Configuration.reopenBrowserOnFail = Config.REOPEN_BROWSER_ON_FAIL;
        Configuration.browser = Config.BROWSER;
        Configuration.timeout = 10000;
        Configuration.pageLoadTimeout = 180000;
        Configuration.browserSize = Config.BROWSER_SIZE;
        SelenideLogger.addListener("allure", new AllureSelenide().savePageSource(false));
    }

    public static void clearReports() {
        log.info(String.format("Clearing reports dir [%s]...", Config.REPORTS_FOLDER));
        File allureResults = new File(Config.REPORTS_FOLDER);
        if (allureResults.isDirectory()) {
            File[] list = allureResults.listFiles();
            if (list != null) {
                Arrays.stream(list)
                        .sequential()
                        .filter(e -> !e.getName().equals("categories.json"))
                        .forEach(File::delete);
            }
        }
    }

    @Step
    public static void browserClear() {
        log.debug("browserClear");
        clearBrowserLocalStorage();
        clearBrowserCookies();
        refresh();
        log.debug("=> DONE");
    }
}
