package com.provectus.kafka.ui.base;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.provectus.kafka.ui.utilities.qaseIoUtils.TestCaseGenerator;
import io.github.cdimascio.dotenv.Dotenv;
import io.qameta.allure.selenide.AllureSelenide;
import lombok.SneakyThrows;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import static org.apache.kafka.common.requests.FetchMetadata.log;

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

    static {
        if (!new File("./.env").exists()) {
            try {
                FileUtils.copyFile(new File(".env.example"), new File(".env"));
            } catch (IOException e) {
                log.error("couldn't copy .env.example to .env. Please add .env");
                e.printStackTrace();
            }
        }
        Dotenv.load().entries().forEach(env -> System.setProperty(env.getKey(), env.getValue()));
        if (Config.CLEAR_REPORTS_DIR) {
            clearReports();
        }
        setup();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (TestCaseGenerator.FAILED) {
                log.error(
                        "Tests FAILED because some problem with @CaseId annotation. Verify that all tests annotated with @CaseId and Id is correct!");
                Runtime.getRuntime().halt(100500);
            }
        }));
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
}
