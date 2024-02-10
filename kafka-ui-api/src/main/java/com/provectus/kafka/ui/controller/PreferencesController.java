package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.PreferencesApi;
import com.provectus.kafka.ui.model.ApplicationsPreferencesDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PreferencesController implements PreferencesApi {

  @Value("${kafka.ui.preferences.removeGitlink}")
  private boolean kafkaUiRemoveGitLink;
  @Value("${kafka.ui.preferences.removeDiscordLink}")
  private boolean kafkaUiRemovDiscordLink;
  @Value("${kafka.ui.preferences.appName}")
  private String kafkaUiAppName;
  @Value("${kafka.ui.preferences.favicon}")
  private String kafkaUiFavicon;
  @Value("${kafka.ui.preferences.logo}")
  private String kafkaUiIcon;


  @Override
  public Mono<ResponseEntity<ApplicationsPreferencesDTO>> getPreferences(ServerWebExchange exchange) {
    ApplicationsPreferencesDTO res = new ApplicationsPreferencesDTO();
    res.setAppName(kafkaUiAppName);
    res.setRemoveDiscordLink(kafkaUiRemoveGitLink);
    res.setRemoveGitLink(kafkaUiRemovDiscordLink);
    res.setLogo(kafkaUiIcon);
    res.setFavicon(kafkaUiFavicon);
    return Mono.just(
        ResponseEntity.ok(res
        )
    );
  }
}
