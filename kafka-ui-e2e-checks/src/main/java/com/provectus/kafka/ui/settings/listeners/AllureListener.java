package com.provectus.kafka.ui.settings.listeners;

import com.codeborne.selenide.Screenshots;
import io.qameta.allure.Allure;
import io.qameta.allure.testng.AllureTestNg;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.io.IOException;
import java.util.Objects;

import static java.nio.file.Files.newInputStream;

public class AllureListener extends AllureTestNg implements ITestListener {

    private void takeScreenshot() {
        File screenshot = Screenshots.takeScreenShotAsFile();
        try {
            Allure.addAttachment(Objects.requireNonNull(screenshot).getName(), newInputStream(screenshot.toPath()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onTestFailure(ITestResult result) {
        takeScreenshot();
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        takeScreenshot();
    }
}
