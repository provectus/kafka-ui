package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

public class SchemaRegistryList {

    private final SelenideElement schemaButton = $(By.xpath("//*[contains(text(),'Create Schema')]"));
    @Step
    public SchemaCreateView clickCreateSchema() {
        BrowserUtils.javaExecutorClick(schemaButton);
        return new SchemaCreateView();
    }
    @Step
    public SchemaView openSchema(String schemaName) {
        $(By.xpath("//*[contains(text(),'" + schemaName + "')]")).click();
        return new SchemaView();
    }

    @Step
    public boolean isSchemaVisible(String schemaName) {
       return  $$("tbody td>a")
                .find(Condition.exactText(schemaName))
                .is(Condition.visible);

    }
}

