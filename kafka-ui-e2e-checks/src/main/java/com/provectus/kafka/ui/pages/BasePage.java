package com.provectus.kafka.ui.pages;

import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WebUtils;

public abstract class BasePage extends WebUtils {
    protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
    protected SelenideElement submitBtn = $x("//button[@type='submit']");
    protected SelenideElement tableGrid = $x("//table");
    protected SelenideElement dotMenuBtn = $x("//button[@aria-label='Dropdown Toggle']");
    protected String tableElementNameLocator = "//tbody//a[contains(text(),'%s')]";

    public void waitUntilSpinnerDisappear(){
            loadingSpinner.shouldBe(Condition.disappear);
    }

    public void clickSubmitButton(){
        clickByJavaScript(submitBtn);
    }

    public void clickTableElement(String elementName){
        $x(String.format(tableElementNameLocator,elementName)).shouldBe(Condition.enabled).click();
    }
}
