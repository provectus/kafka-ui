package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.PreferenceseApi;
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
public class PreferencesController implements PreferenceseApi {

  @Value("${kafka.ui.preferences.removegitlink}")
  private String kafkaUiRemoveGitLink;


  @Override
  public Mono<ResponseEntity<ApplicationsPreferencesDTO>> getPreferences(ServerWebExchange exchange) {
    return null;
  }
}
