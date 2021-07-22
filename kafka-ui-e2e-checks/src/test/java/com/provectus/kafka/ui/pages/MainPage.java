package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import io.qameta.allure.Step;
import lombok.SneakyThrows;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.*;
import static com.provectus.kafka.ui.helpers.WaitUtils.refreshUntil;

public class MainPage {

  private static final long TIMEOUT = 25000;

  protected static final String path = "";

  @Step
  public MainPage isOnPage() {
    $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
    $(By.xpath("//h5[text()='Clusters']")).shouldBe(Condition.visible);
    return this;
  }

  @SneakyThrows
  public void isTopic(String topicName) {
    refreshUntil(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)));
  }

  public enum SideMenuOptions {
    BROKERS("Brokers"),
    TOPICS("Topics"),
    CONSUMERS("Consumers"),
    SCHEMA_REGISTRY("Schema registry");

    String value;

    SideMenuOptions(String value) {
      this.value = value;
    }
  }

  @Step
  public MainPage goToSideMenu(String clusterName, SideMenuOptions option) {
    $(By.xpath("//aside//*[a[text()='%s']]//a[text()='%s']".formatted(clusterName, option.value)))
        .click();
    return this;
  }
}
