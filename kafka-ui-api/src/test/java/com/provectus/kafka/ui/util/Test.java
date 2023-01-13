package com.provectus.kafka.ui.util;

import java.time.Duration;
import java.util.List;
import java.util.Properties;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import reactor.core.publisher.Flux;

public class Test {

  public static void main(String[] args) {
    for (int i = 0; i < 1; i++) {
      System.out.println(i);
      main1();
    }
  }

  static void main1() {
    Properties p = new Properties();
    p.setProperty(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    p.setProperty(ConsumerConfig.GROUP_ID_CONFIG, "ololo2-" + System.currentTimeMillis());
    p.setProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    p.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
    p.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
    p.setProperty(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
    p.setProperty(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1");

    try (KafkaConsumer<String, String> c = new KafkaConsumer<String, String>(p)) {
      c.subscribe(List.of("test2"));
      while (true) {
        if (c.poll(Duration.ofSeconds(100)).count() != 0) {
         // c.commitSync();
         // break;
        }
      }
    }
  }

}
