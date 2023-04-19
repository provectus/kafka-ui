package com.provectus.kafka.ui.utilities.qase;

import static com.provectus.kafka.ui.settings.BaseSource.SUITE_NAME;
import static com.provectus.kafka.ui.variables.Suite.MANUAL;
import static org.apache.commons.lang3.BooleanUtils.FALSE;
import static org.apache.commons.lang3.BooleanUtils.TRUE;
import static org.apache.commons.lang3.StringUtils.isEmpty;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class QaseSetup {

  public static void qaseIntegrationSetup() {
    String qaseApiToken = System.getProperty("QASEIO_API_TOKEN");
    if (isEmpty(qaseApiToken)) {
      log.warn("Integration with Qase is disabled due to run config or token wasn't defined.");
      System.setProperty("QASE_ENABLE", FALSE);
    } else {
      log.warn("Integration with Qase is enabled. Find this run at https://app.qase.io/run/KAFKAUI.");
      String automation = SUITE_NAME.equalsIgnoreCase(MANUAL) ? "" : "Automation ";
      System.setProperty("QASE_ENABLE", TRUE);
      System.setProperty("QASE_PROJECT_CODE", "KAFKAUI");
      System.setProperty("QASE_API_TOKEN", qaseApiToken);
      System.setProperty("QASE_USE_BULK", TRUE);
      System.setProperty("QASE_RUN_NAME", DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")
          .format(OffsetDateTime.now(ZoneOffset.UTC)) + ": " + automation + SUITE_NAME.toUpperCase() + " suite");
    }
  }
}
