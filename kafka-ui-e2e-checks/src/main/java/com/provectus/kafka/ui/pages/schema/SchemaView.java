package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

public class SchemaView {

    protected SelenideElement dotMenuBtn = $$x("//button[@aria-label='Dropdown Toggle']").first();

    @Step
    public SchemaView waitUntilScreenReady() {
        $("div#schema").shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaView isCompatibility(CompatibilityLevel.CompatibilityEnum compatibility){
        $x("//div//p[.='" + compatibility.getValue() + "']").shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaEditView openEditSchema(){
        $x("//button[text()= 'Edit Schema']").click();
        return new SchemaEditView();
    }
    @Step
    public SchemaRegistryList removeSchema() {
        BrowserUtils.javaExecutorClick(dotMenuBtn);
        $(By.xpath("//*[contains(text(),'Remove')]")).click();
        SelenideElement confirmButton = $x("//div[@role=\"dialog\"]//button[text()='Confirm']");
        confirmButton.shouldBe(Condition.enabled).click();
        confirmButton.shouldBe(Condition.disappear);
        return new SchemaRegistryList();
    }
}
