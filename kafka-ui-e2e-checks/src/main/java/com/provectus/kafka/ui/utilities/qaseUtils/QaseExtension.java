package com.provectus.kafka.ui.utilities.qaseUtils;

import lombok.extern.slf4j.Slf4j;

import java.text.SimpleDateFormat;
import java.util.Date;

import static com.provectus.kafka.ui.settings.BaseSource.SUITE;
import static org.apache.commons.lang3.BooleanUtils.FALSE;
import static org.apache.commons.lang3.BooleanUtils.TRUE;

@Slf4j
public class QaseExtension {

    public static void setupQaseExtension() {
        String qaseApiToken = System.getProperty("QASEIO_API_TOKEN");
        if (qaseApiToken.isEmpty()) {
            log.warn("QASEIO_API_TOKEN system property wasn't set. Support for Qase will be disabled.");
            System.setProperty("QASE_ENABLE", FALSE);
        } else {
            log.warn("QASEIO_API_TOKEN was set. Find this run at https://app.qase.io/run/KAFKAUI.");
            System.setProperty("QASE_ENABLE", TRUE);
            System.setProperty("QASE_PROJECT_CODE", "KAFKAUI");
            System.setProperty("QASE_API_TOKEN", qaseApiToken);
            System.setProperty("QASE_USE_BULK", TRUE);
            System.setProperty("QASE_RUN_NAME", "Automation " + SUITE.toUpperCase() + ": " +
                    new SimpleDateFormat("dd.MM.yyyy HH:mm").format(new Date()));
        }
    }
}
