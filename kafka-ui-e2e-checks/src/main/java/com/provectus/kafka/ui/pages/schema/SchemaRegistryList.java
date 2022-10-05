package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.utilities.WebUtils.clickByJavaScript;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;

public class SchemaRegistryList {

    private final SelenideElement schemaButton = $(By.xpath("//*[contains(text(),'Create Schema')]"));

    @Step
    public SchemaRegistryList waitUntilScreenReady(){
        $x("//*[contains(text(),'Loading')]").shouldBe(Condition.disappear);
        $x("//button[text()=' Create Schema']").shouldBe(Condition.visible);
        return this;
    }

    @Step
    public SchemaCreateForm clickCreateSchema() {
        clickByJavaScript(schemaButton);
        return new SchemaCreateForm();
    }

    @Step
    public SchemaDetails openSchema(String schemaName) {
        $(By.xpath("//*[contains(text(),'" + schemaName + "')]")).click();
        return new SchemaDetails();
    }

    @Step
    public boolean isSchemaVisible(String schemaName) {
        $(By.xpath("//table")).shouldBe(Condition.visible);
        return isVisible($x("//tbody//td//a[text()='" + schemaName + "']"));
    }
}


