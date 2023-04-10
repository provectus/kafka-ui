package com.provectus.kafka.ui.pages.panels;

import static com.codeborne.selenide.Selenide.$x;
import static com.provectus.kafka.ui.settings.BaseSource.CLUSTER_NAME;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import com.provectus.kafka.ui.pages.BasePage;
import com.provectus.kafka.ui.pages.panels.enums.MenuItem;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class NaviSideBar extends BasePage {

  protected SelenideElement dashboardMenuItem = $x("//a[@title='Dashboard']");
  protected String sideMenuOptionElementLocator = ".//ul/li[contains(.,'%s')]";
  protected String clusterElementLocator = "//aside/ul/li[contains(.,'%s')]";

  private SelenideElement expandCluster(String clusterName) {
    SelenideElement clusterElement = $x(String.format(clusterElementLocator, clusterName)).shouldBe(Condition.visible);
    if (clusterElement.parent().$$x(".//ul").size() == 0) {
      clickByActions(clusterElement);
    }
    return clusterElement;
  }

  @Step
  public NaviSideBar waitUntilScreenReady() {
    waitUntilSpinnerDisappear();
    dashboardMenuItem.shouldBe(Condition.visible, Duration.ofSeconds(30));
    return this;
  }

  @Step
  public String getPagePath(MenuItem menuItem) {
    return getPagePathFromHeader(menuItem)
        .shouldBe(Condition.visible)
        .getText().trim();
  }

  @Step
  public NaviSideBar openSideMenu(String clusterName, MenuItem menuItem) {
    clickByActions(expandCluster(clusterName).parent()
        .$x(String.format(sideMenuOptionElementLocator, menuItem.getNaviTitle())));
    return this;
  }

  @Step
  public NaviSideBar openSideMenu(MenuItem menuItem) {
    openSideMenu(CLUSTER_NAME, menuItem);
    return this;
  }

  public List<SelenideElement> getAllMenuButtons() {
    expandCluster(CLUSTER_NAME);
    return Stream.of(MenuItem.values())
        .map(menuItem -> $x(String.format(sideMenuOptionElementLocator, menuItem.getNaviTitle())))
        .collect(Collectors.toList());
  }
}
