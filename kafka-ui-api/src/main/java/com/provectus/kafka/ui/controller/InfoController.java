package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.TimeStampFormatApi;
import com.provectus.kafka.ui.model.TimeStampFormatDTO;
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
public class InfoController extends AbstractController implements TimeStampFormatApi {

  @Value("${timestamp.format:dd.MM.YYYY HH:mm:ss}")
  private String timeStampFormat;
  @Value("${timestamp.format:DD.MM.YYYY HH:mm:ss}")
  private String timeStampFormatIso;

  @Override
  public Mono<ResponseEntity<TimeStampFormatDTO>> getTimeStampFormat(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(new TimeStampFormatDTO().timeStampFormat(timeStampFormat)));
  }

  @Override
  public Mono<ResponseEntity<TimeStampFormatDTO>> getTimeStampFormatISO(ServerWebExchange exchange) {
    return Mono.just(ResponseEntity.ok(new TimeStampFormatDTO().timeStampFormat(timeStampFormatIso)));
  }
}
