package com.provectus.kafka.ui.pages.connector;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utils.BrowserUtils;
import com.provectus.kafka.ui.extensions.WaitUtils;
import io.qameta.allure.Step;
import lombok.experimental.ExtensionMethod;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.provectus.kafka.ui.screenshots.Screenshooter.log;
import static java.lang.Thread.sleep;

@ExtensionMethod(WaitUtils.class)
public class ConnectorCreateView {

    SelenideElement nameField = $(By.xpath("//input[@name='name']"));
    SelenideElement contentTextArea = $(".ace_text-input");
    SelenideElement submitButton = $(By.xpath("//button[@type='submit']"));

    private static final String path = "/ui/clusters/secondLocal/connectors/create_new";

    @Step("Set connector config JSON")
    public ConnectorsView setConnectorConfig(String connectName, String configJson) throws InterruptedException {
        nameField.setValue(connectName);
        $("#config").click();
        contentTextArea.setValue("");
        contentTextArea.setValue(String.valueOf(configJson.toCharArray()));
        nameField.click();
        BrowserUtils.javaExecutorClick(submitButton);
        sleep(4000);
        log.info("Connector config is submitted");
        return new ConnectorsView();
    }

    @Step("Verify that page 'Create Connector' opened")
    public ConnectorCreateView isOnConnectorCreatePage() {
        nameField.shouldBe(Condition.visible);
        return this;
    }
}