package com.provectus.kafka.ui.service.metrics;

import static org.junit.jupiter.api.Assertions.*;

import javax.management.ObjectName;
import org.junit.jupiter.api.Test;

class JmxMetricsFormatterTest {



  @Test
  void test(){
    JmxMetricsFormatter.constructMetricsList(
        new ObjectName(
            ""
        )
    );
  }

}