package com.provectus.kafka.ui.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

class GithubReleaseInfoTest {

  private final MockWebServer mockWebServer = new MockWebServer();

  @BeforeEach
  void startMockServer() throws IOException {
    mockWebServer.start();
  }

  @AfterEach
  void stopMockServer() throws IOException {
    mockWebServer.close();
  }

  @Test
  void test() {
    mockWebServer.enqueue(new MockResponse()
        .addHeader("content-type: application/json")
        .setBody("""
            {
              "published_at": "2023-03-09T16:11:31Z",
              "tag_name": "v0.6.0",
              "html_url": "https://github.com/provectus/kafka-ui/releases/tag/v0.6.0",
              "some_unused_prop": "ololo"
            }
            """));
    var url = mockWebServer.url("repos/provectus/kafka-ui/releases/latest");
    var mono = GithubReleaseInfo.createCachedMono(url.toString());
    StepVerifier.create(mono)
        .assertNext(r -> {
          assertThat(r.html_url())
              .isEqualTo("https://github.com/provectus/kafka-ui/releases/tag/v0.6.0");
          assertThat(r.published_at())
              .isEqualTo("2023-03-09T16:11:31Z");
          assertThat(r.tag_name())
              .isEqualTo("v0.6.0");
        })
        .verifyComplete();
  }

}
