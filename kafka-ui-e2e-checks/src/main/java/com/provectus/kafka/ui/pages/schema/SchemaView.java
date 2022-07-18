package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.provectus.kafka.ui.api.model.CompatibilityLevel;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

public class SchemaView {

    @Step
    public SchemaView isOnSchemaViewPage() {
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

    public SchemaRegistryList removeSchema() {
        BrowserUtils.javaExecutorClick($(".dropdown.is-right button"));
        $(By.xpath("//*[contains(text(),'Remove')]")).click();
        $(By.xpath("//*[text()='Submit']")).shouldBe(Condition.visible).click();
        return new SchemaRegistryList();
    }
}
