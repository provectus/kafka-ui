package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Condition;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import static com.codeborne.selenide.Selenide.$;

public class MainPage {

  private static final long TIMEOUT = 25000;

  @Step
  public MainPage shouldBeOnPage() {
    $(By.xpath("//*[contains(text(),'Loading')]")).shouldBe(Condition.disappear);
    $(By.xpath("//h5[text()='Clusters']")).shouldBe(Condition.visible);
    return this;
  }

  public void shouldBeTopic(String topicName) {
    var topic = $(By.xpath("//div[contains(@class,'section')]//table//a[text()='%s']".formatted(topicName)));
    topic.waitUntil(Condition.exist,TIMEOUT);
    topic.shouldBe(Condition.visible);
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
