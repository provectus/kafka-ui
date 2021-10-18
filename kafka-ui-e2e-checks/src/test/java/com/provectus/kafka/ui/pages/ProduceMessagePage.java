package com.provectus.kafka.ui.pages;
import org.openqa.selenium.Keys;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.Wait;

public class ProduceMessagePage extends TopicView {

    private final SelenideElement keyField = $(By.xpath("//div[@id = 'key']/textarea"));
    private final SelenideElement contentField = $(By.xpath("//div[@id = 'content']/textarea"));
    private final SelenideElement headersField = $(By.xpath("//div[@id = 'headers']/textarea"));
    private final SelenideElement sendBtn = $(By.xpath("//button[@type = 'submit']"));
    private static final String DELETE_BUTTON_TEXT = "Delete";





    public ProduceMessagePage typeIntoKeyFiled(String value) {
        Wait().until(ExpectedConditions.urlContains("message"));
        keyField.sendKeys(Keys.chord(Keys.DELETE));
        keyField.setValue(value);
        return new ProduceMessagePage();

    }

    public ProduceMessagePage typeIntoContentFiled(String value) {
        Wait().until(ExpectedConditions.urlContains("message"));
        contentField.sendKeys(Keys.DELETE);
        contentField.setValue(value);
        return new ProduceMessagePage();
    }

    public ProduceMessagePage typeIntoHeaderFiled(String value) {
        headersField.waitUntil(Condition.visible, 10000).setValue(value);
        return new ProduceMessagePage();
    }

    public TopicView submitProduceMessage(String name) {
        sendBtn.click();
        Wait().until(ExpectedConditions.urlContains(name));
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return new TopicView();
    }
}
