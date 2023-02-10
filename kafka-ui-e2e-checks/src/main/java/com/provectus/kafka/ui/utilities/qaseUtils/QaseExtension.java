package com.provectus.kafka.ui.utilities.qaseUtils;

import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import static org.apache.commons.lang3.BooleanUtils.FALSE;
import static org.apache.commons.lang3.BooleanUtils.TRUE;
import static org.apache.commons.lang3.StringUtils.isEmpty;

@Slf4j
public class QaseExtension {

    public static void testRunSetup() {
        String qaseApiToken = System.getProperty("QASEIO_API_TOKEN");
        String qaseEnabled = System.getProperty("INPUT_QASE_ENABLED");
        String testSuite = System.getProperty("INPUT_TEST_SUITE");
        if (isEmpty(qaseApiToken) || !Boolean.parseBoolean(qaseEnabled)) {
            log.warn("Integration with Qase is disabled due to run config or token wasn't defined.");
            System.setProperty("QASE_ENABLE", FALSE);
        } else {
            log.warn("Integration with Qase is enabled. Find this run at https://app.qase.io/run/KAFKAUI.");
            System.setProperty("QASE_ENABLE", TRUE);
            System.setProperty("QASE_PROJECT_CODE", "KAFKAUI");
            System.setProperty("QASE_API_TOKEN", qaseApiToken);
            System.setProperty("QASE_USE_BULK", TRUE);
            System.setProperty("QASE_RUN_NAME", DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
                    .format(OffsetDateTime.now(ZoneOffset.UTC)) + ": " + "Automation " + testSuite.toUpperCase() + " suite");
        }
    }
}
