package com.provectus.kafka.ui.util;

import com.google.common.annotations.VisibleForTesting;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
public class GithubReleaseInfo {

  private static final String GITHUB_LATEST_RELEASE_RETRIEVAL_URL =
      "https://api.github.com/repos/provectus/kafka-ui/releases/latest";

  private static final Duration GITHUB_API_MAX_WAIT_TIME = Duration.ofSeconds(2);

  public record GithubReleaseDto(String html_url, String tag_name, String published_at) {

    static GithubReleaseDto empty() {
      return new GithubReleaseDto(null, null, null);
    }
  }

  private volatile GithubReleaseDto release = GithubReleaseDto.empty();

  private final Mono<Void> refreshMono;

  public GithubReleaseInfo() {
    this(GITHUB_LATEST_RELEASE_RETRIEVAL_URL);
  }

  @VisibleForTesting
  GithubReleaseInfo(String url) {
    this.refreshMono = new WebClientConfigurator().build()
        .get()
        .uri(url)
        .exchangeToMono(resp -> resp.bodyToMono(GithubReleaseDto.class))
        .timeout(GITHUB_API_MAX_WAIT_TIME)
        .doOnError(th -> log.trace("Error getting latest github release info", th))
        .onErrorResume(th -> true, th -> Mono.just(GithubReleaseDto.empty()))
        .doOnNext(release -> this.release = release)
        .then();
  }

  public GithubReleaseDto get() {
    return release;
  }

  public Mono<Void> refresh() {
    return refreshMono;
  }

}
