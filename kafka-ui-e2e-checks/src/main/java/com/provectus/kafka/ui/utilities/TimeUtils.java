package com.provectus.kafka.ui.utilities;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalTime;

import static com.codeborne.selenide.Selenide.sleep;

@Slf4j
public class TimeUtils {

    public static void waitUntilNewMinuteStarted() {
        int secondsLeft = 60 - LocalTime.now().getSecond();
        log.debug("\nwaitUntilNewMinuteStarted: {}s", secondsLeft);
        sleep(secondsLeft * 1000);
    }
}
