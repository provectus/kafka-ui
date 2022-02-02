package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

import static com.codeborne.selenide.Selenide.$;
import static com.provectus.kafka.ui.screenshots.Screenshooter.log;
import static java.lang.Thread.sleep;

@ExtensionMethod(WaitUtils.class)
public class ConnectorCreateView {
    private static final String path = "ui/clusters/secondLocal/connectors/create_new";

    @Step
    public ConnectorsView setConnectorConfig(String connectName, String configJson) throws InterruptedException {
        $(By.xpath("//input[@name='name']")).sendKeys(connectName);
        $(".ace_text-input").sendKeys(Keys.BACK_SPACE);
        $(".ace_text-input").sendKeys(Keys.BACK_SPACE);
        $(".ace_text-input").sendKeys(String.valueOf(configJson.toCharArray()));
        $(By.xpath("//input[@name='name']")).click();
        $(By.xpath("//input[@type='submit']")).click();
        sleep(2000);
        log.info("Connector config is submitted");
        return new ConnectorsView();
    }

    @Step
    public ConnectorCreateView isOnConnectorCreatePage() {
        $(By.xpath("//input[@name='name']")).shouldBe(Condition.visible);
        return this;
    }
}