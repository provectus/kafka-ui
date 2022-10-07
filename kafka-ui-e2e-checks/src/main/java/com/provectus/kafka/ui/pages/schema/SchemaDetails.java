package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;

public class SchemaDetails {

    protected SelenideElement dotMenuBtn = $$x("//button[@aria-label='Dropdown Toggle']").first();

    @Step
    public SchemaDetails waitUntilScreenReady() {
        $("div#schema").shouldBe(Condition.visible);
        return this;
    }

    @Step
    public String getCompatibility() {
        return $x("//h4[contains(text(),'Compatibility')]/../p").getText();
    }

    @Step
    public SchemaDetails openEditSchema(){
        $x("//button[text()= 'Edit Schema']").click();
        return this;
    }

    @Step
    public SchemaRegistryList removeSchema() {
        clickByJavaScript(dotMenuBtn);
        $(By.xpath("//*[contains(text(),'Remove')]")).click();
        SelenideElement confirmButton = $x("//div[@role=\"dialog\"]//button[text()='Confirm']");
        confirmButton.shouldBe(Condition.enabled).click();
        confirmButton.shouldBe(Condition.disappear);
        return new SchemaRegistryList();
    }
}
