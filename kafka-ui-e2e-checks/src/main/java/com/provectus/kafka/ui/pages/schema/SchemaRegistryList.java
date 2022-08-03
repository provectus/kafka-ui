package com.provectus.kafka.ui.pages.schema;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utils.BrowserUtils;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;

public class SchemaRegistryList {

    private final SelenideElement schemaButton = $(By.xpath("//*[contains(text(),'Create Schema')]"));

    public SchemaCreateView clickCreateSchema() {
        BrowserUtils.javaExecutorClick(schemaButton);
        return new SchemaCreateView();
    }

    public SchemaView openSchema(String schemaName) {
        $(By.xpath("//*[contains(text(),'" + schemaName + "')]")).click();
        return  SchemaView.INSTANCE;
    }

    @SneakyThrows
    public boolean isNotVisible(String schemaName) {
        return $x(String.format("//*[contains(text(),'%s')]", schemaName)).is(Condition.not(Condition.visible));
    }

    @Step
    public void isSchemaVisible(String schemaName) {
        $$("tbody td>a")
                .find(Condition.exactText(schemaName)).is(Condition.visible);
//        element.shouldBe(Condition.visible);
//        return element.is(Condition.visible);
    }
}

