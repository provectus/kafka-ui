package com.provectus.kafka.ui.cluster.service;

import com.provectus.kafka.ui.AbstractBaseTest;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;

@ContextConfiguration(initializers = {AbstractBaseTest.Initializer.class})
@Log4j2
@AutoConfigureWebTestClient(timeout = "10000")
class KafkaConnectServiceTest extends AbstractBaseTest {

    @Autowired
    WebTestClient webTestClient;

    @Test
    void getConnectorsReturnsEmptyArray() {
        webTestClient
                .get()
                .uri("http://localhost:8080/api/clusters/local/connectors")
                .exchange()
                .expectStatus().isOk()
                .expectBody(String[].class)
                .consumeWith(result -> assertThat(result)
                        .asList().isEmpty());
    }
}