package com.provectus.kafka.ui.util;

import com.google.common.annotations.VisibleForTesting;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
public class GithubReleaseInfo {

  private static final String GITHUB_LATEST_RELEASE_RETRIEVAL_URL =
      "https://api.github.com/repos/provectus/kafka-ui/releases/latest";

  private static final Duration GITHUB_API_MAX_WAIT_TIME = Duration.ofSeconds(2);

  private static final Duration CACHE_DURATION = Duration.ofMinutes(5);

  public record GithubReleaseDto(String html_url, String tag_name, String published_at) {
  }

  private final Mono<GithubReleaseDto> cachedMono;

  public GithubReleaseInfo() {
    this(GITHUB_LATEST_RELEASE_RETRIEVAL_URL, CACHE_DURATION);
  }

  @VisibleForTesting
  GithubReleaseInfo(String url, Duration cacheDuration) {
    this.cachedMono = WebClient.create()
        .get()
        .uri(url)
        .exchangeToMono(resp -> resp.bodyToMono(GithubReleaseDto.class))
        .timeout(GITHUB_API_MAX_WAIT_TIME)
        .doOnError(th -> log.trace("Error getting latest github release info", th))
        .onErrorResume(th -> true, th -> Mono.just(new GithubReleaseDto(null, null, null)))
        .cache(cacheDuration);
  }

  public Mono<GithubReleaseDto> get() {
    return cachedMono;
  }

}
