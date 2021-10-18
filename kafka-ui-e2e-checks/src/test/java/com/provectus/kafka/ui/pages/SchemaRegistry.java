

package com.provectus.kafka.ui.pages;


import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import lombok.SneakyThrows;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.Wait;

public class SchemaRegistry extends MainPage{
    private SelenideElement schemabutton = $(By.xpath("//*[contains(text(),'Create Schema')]"));
    private SelenideElement subjectname = $(By.xpath("//input[@name='subject']"));
    private SelenideElement schemafield = $(By.xpath("//textarea[@name='schema']"));
    private SelenideElement schemaTypeDropdown = $(By.xpath("//select[@name='schemaType']"));
    private SelenideElement submitSchema = $(By.xpath("//input[@type='submit']"));

    public SchemaRegistry selectFromDropdown(SchemaType option){
        Select schemaType = new Select(schemaTypeDropdown);
        schemaType.selectByVisibleText(option.getValue());
        return this;
    }

    public SchemaRegistry clickSubmit(){
        submitSchema.click();
        return new SchemaRegistry();
    }

    public SchemaRegistry setSubjectname(String name){
        subjectname.setValue(name);
        return this;
    }

    public SchemaRegistry setSchemafield(String text){
        schemafield.setValue(text);
        return this;
}

    public SchemaRegistry clickCreateschema(){
        schemabutton.click();
        return this;
    }

    public SchemaRegistry openSchema(String schemaName){
        $(By.xpath("//*[contains(text(),'"+schemaName+"')]")).click();
        Wait().until(ExpectedConditions.urlContains(schemaName+"/latest"));
        return this;
    }

    public void removeSchema(){
        $(By.xpath("//*[contains(text(),'Remove')]")).click();
        $(By.xpath("//*[text()='Confirm']")).shouldBe(Condition.visible).click();
    }

    @SneakyThrows
    public SchemaRegistry isNotVisible(String schemaName) {
//        By.xpath("//div[contains(@class,'section')]//table").refreshUntil(Condition.visible);
        Thread.sleep(10000);
        $(By.xpath("//*[contains(text(),'%s')]".formatted(schemaName))).shouldNotBe(Condition.visible);
        return this;
    }





}












