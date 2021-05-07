package com.provectus.kafka.ui.pages;

import com.codeborne.selenide.Selenide;
import com.provectus.kafka.ui.base.TestConfiguration;

public class Pages {

    public static Pages INSTANCE = new Pages();

    public MainPage mainPage = new MainPage();

    private Pages goTo(String path) {
        Selenide.open(TestConfiguration.BASE_URL+path);
        return this;
    }
    public Pages open() {
       return goTo("");
    }
}
