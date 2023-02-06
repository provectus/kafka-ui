package com.provectus.kafka.ui.utilities.qaseIoUtils;

import lombok.extern.slf4j.Slf4j;

import java.text.SimpleDateFormat;
import java.util.Date;

import static com.provectus.kafka.ui.settings.BaseSource.SUITE;

@Slf4j
public class QaseUtils {

    public static void setupQaseExtension() {
        String qaseApiToken = System.getProperty("QASEIO_API_TOKEN");
        if (qaseApiToken.isEmpty()) {
            log.warn("QASEIO_API_TOKEN system property wasn't set. Support for Qase will be disabled.");
            System.setProperty("QASE_ENABLE", "false");
        } else {
            log.warn("QASEIO_API_TOKEN was set. Find this run at https://app.qase.io/run/KAFKAUI.");
            System.setProperty("QASE_ENABLE", "true");
            System.setProperty("QASE_PROJECT_CODE", "KAFKAUI");
            System.setProperty("QASE_API_TOKEN", qaseApiToken);
            System.setProperty("QASE_USE_BULK", "false");
            System.setProperty("QASE_RUN_NAME", "Automation " + SUITE.toUpperCase() + ": " +
                    new SimpleDateFormat("dd.MM.yyyy HH:mm").format(new Date()));
        }
    }
}
