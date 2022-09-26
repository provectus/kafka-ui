package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.utilities.WebUtils.isVisible;
import static com.provectus.kafka.ui.utilities.WebUtils.javaExecutorClick;

public class SchemaRegistryList {

    private final SelenideElement schemaButton = $(By.xpath("//*[contains(text(),'Create Schema')]"));

    @Step
    public SchemaCreateView clickCreateSchema() {
        javaExecutorClick(schemaButton);
        return new SchemaCreateView();
    }

    @Step
    public SchemaView openSchema(String schemaName) {
        $(By.xpath("//*[contains(text(),'" + schemaName + "')]")).click();
        return new SchemaView();
    }

    @Step
    public boolean isSchemaVisible(String schemaName) {
        $(By.xpath("//table")).shouldBe(Condition.visible);
        return isVisible($x("//tbody//td//a[text()='" + schemaName + "']"));
    }
}


