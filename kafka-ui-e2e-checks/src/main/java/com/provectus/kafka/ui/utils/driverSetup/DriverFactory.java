package com.provectus.kafka.ui.utils.driverSetup;

import lombok.SneakyThrows;
import org.openqa.selenium.chrome.ChromeDriverLogLevel;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class DriverFactory {

    @SneakyThrows(MalformedURLException.class)
    public static RemoteWebDriver createDriver(int port) {
        return new RemoteWebDriver(new URL(String.format("http://localhost:%s/wd/hub", port)), getOptions());
    }

    private static ChromeOptions getOptions() {
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("profile.default_content_setting_values.notifications", 2);
        prefs.put("profile.managed_default_content_settings.javascript", 1);
        prefs.put("credentials_enable_service", false);
        prefs.put("profile.password_manager_enabled", false);

        final ChromeOptions chromeOptions = new ChromeOptions();

        chromeOptions.setLogLevel(ChromeDriverLogLevel.SEVERE)
                .setExperimentalOption("excludeSwitches", Collections.singletonList("enable-automation"))
                .addArguments("--disable-gpu", "--disable-logging", "--disable-dev-shm-usage")
                .setAcceptInsecureCerts(true)
                .setExperimentalOption("prefs", prefs);

        return chromeOptions;
    }

}
