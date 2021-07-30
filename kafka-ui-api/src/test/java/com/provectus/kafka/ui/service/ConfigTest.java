package com.provectus.kafka.ui.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.AbstractBaseTest;
import com.provectus.kafka.ui.model.BrokerConfig;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@AutoConfigureWebTestClient(timeout = "60000")
public class ConfigTest extends AbstractBaseTest {

  @Autowired
  private WebTestClient webTestClient;

  @Test
  public void testAlterConfig() throws Exception {
    String name = "background.threads";

    Optional<BrokerConfig> bc = getConfig(name);
    assertThat(bc.isPresent()).isTrue();
    assertThat(bc.get().getValue()).isEqualTo("10");

    webTestClient.put()
        .uri("/api/clusters/{clusterName}/brokers/{id}/configs/{name}", LOCAL, 1, name)
        .bodyValue(Map.of(
            "name", name,
            "value", "5"
            )
        )
        .exchange()
        .expectStatus().isOk();

    // Without sleep it returns old config so we need to wait a little bit
    Thread.sleep(1000);

    Optional<BrokerConfig> bcc = getConfig(name);
    assertThat(bcc.isPresent()).isTrue();
    assertThat(bcc.get().getValue()).isEqualTo("5");
  }

  @Test
  public void testAlterReadonlyConfig() {
    String name = "log.dirs";

    webTestClient.put()
        .uri("/api/clusters/{clusterName}/brokers/{id}/configs/{name}", LOCAL, 1, name)
        .bodyValue(Map.of(
            "name", name,
            "value", "/var/lib/kafka2"
            )
        )
        .exchange()
        .expectStatus().isBadRequest();
  }

  private Optional<BrokerConfig> getConfig(String name) {
    List<BrokerConfig> configs = webTestClient.get()
        .uri("/api/clusters/{clusterName}/brokers/{id}/configs", LOCAL, 1)
        .exchange()
        .expectStatus().isOk()
        .expectBody(new ParameterizedTypeReference<List<BrokerConfig>>() {
        })
        .returnResult()
        .getResponseBody();

    return configs.stream()
        .filter(c -> c.getName().equals(name))
        .findAny();
  }
}
