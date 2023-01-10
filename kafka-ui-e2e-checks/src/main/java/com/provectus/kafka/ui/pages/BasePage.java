package com.provectus.kafka.ui.pages;

import static com.codeborne.selenide.Selenide.$$x;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.utilities.WebUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class BasePage extends WebUtils {

  protected SelenideElement loadingSpinner = $x("//*[contains(text(),'Loading')]");
  protected SelenideElement submitBtn = $x("//button[@type='submit']");
  protected SelenideElement tableGrid = $x("//table");
  protected SelenideElement dotMenuBtn = $x("//button[@aria-label='Dropdown Toggle']");
  protected SelenideElement alertHeader = $x("//div[@role='alert']//div[@role='heading']");
  protected SelenideElement alertMessage = $x("//div[@role='alert']//div[@role='contentinfo']");
  protected SelenideElement confirmBtn = $x("//button[contains(text(),'Confirm')]");
  protected ElementsCollection allGridItems = $$x("//tr[@class]");
  protected String summaryCellLocator = "//div[contains(text(),'%s')]";
  protected String tableElementNameLocator = "//tbody//a[contains(text(),'%s')]";
  protected String columnHeaderLocator = "//table//tr/th//div[text()='%s']";

  protected void waitUntilSpinnerDisappear() {
    log.debug("\nwaitUntilSpinnerDisappear");
    loadingSpinner.shouldBe(Condition.disappear);
  }

  protected void clickSubmitBtn() {
    clickByJavaScript(submitBtn);
  }

  protected SelenideElement getTableElement(String elementName) {
    log.debug("\ngetTableElement: {}", elementName);
    return $x(String.format(tableElementNameLocator, elementName));
  }

  protected String getAlertHeader() {
    log.debug("\ngetAlertHeader");
    String result = alertHeader.shouldBe(Condition.visible).getText();
    log.debug("-> {}", result);
    return result;
  }

  protected String getAlertMessage() {
    log.debug("\ngetAlertMessage");
    String result = alertMessage.shouldBe(Condition.visible).getText();
    log.debug("-> {}", result);
    return result;
  }

  protected boolean isAlertVisible(AlertHeader header) {
    log.debug("\nisAlertVisible: {}", header.toString());
    boolean result = getAlertHeader().equals(header.toString());
    log.debug("-> {}", result);
    return result;
  }

  protected boolean isAlertVisible(AlertHeader header, String message) {
    log.debug("\nisAlertVisible: {} {}", header, message);
    boolean result = isAlertVisible(header) && getAlertMessage().equals(message);
    log.debug("-> {}", result);
    return result;
  }

  protected void clickConfirmButton() {
    confirmBtn.shouldBe(Condition.enabled).click();
    confirmBtn.shouldBe(Condition.disappear);
  }

  public enum AlertHeader {
    SUCCESS("Success"),
    VALIDATION_ERROR("Validation Error"),
    BAD_REQUEST("400 Bad Request");

    private final String value;

    AlertHeader(String value) {
      this.value = value;
    }

    public String toString() {
      return value;
    }
  }
}
