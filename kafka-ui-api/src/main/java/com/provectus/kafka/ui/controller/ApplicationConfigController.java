package com.provectus.kafka.ui.controller;

import static com.provectus.kafka.ui.model.rbac.permission.ApplicationConfigAction.*;
import static com.provectus.kafka.ui.util.ApplicationConfigExporter.*;
import static org.springframework.boot.env.SpringApplicationJsonEnvironmentPostProcessor.SPRING_APPLICATION_JSON_PROPERTY;

import com.provectus.kafka.ui.KafkaUiApplication;
import com.provectus.kafka.ui.api.ApplicationConfigApi;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.ApplicationConfigDTO;
import com.provectus.kafka.ui.model.ApplicationConfigFormatDTO;
import com.provectus.kafka.ui.model.RestartRequestDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import org.yaml.snakeyaml.Yaml;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ApplicationConfigController implements ApplicationConfigApi, ApplicationListener<ApplicationStartedEvent> {

  private final AccessControlService accessControlService;
  private ConfigurableApplicationContext applicationContext;

  @Override
  public void onApplicationEvent(ApplicationStartedEvent event) {
    this.applicationContext = event.getApplicationContext();
  }

  @Override
  public Mono<ResponseEntity<ApplicationConfigDTO>> getCurrentConfig(ApplicationConfigFormatDTO format,
                                                                     ServerWebExchange exchange) {
    return accessControlService
        .validateAccess(
            AccessContext.builder()
                .applicationConfigActions(VIEW)
                .build()
        )
        .then(Mono.fromSupplier(() -> {
          String configString = switch (format) {
            case JSON -> exportAsJson(applicationContext.getEnvironment());
            case YAML -> exportAsYaml(applicationContext.getEnvironment());
          };
          return ResponseEntity.ok(
              new ApplicationConfigDTO()
                  .config(configString)
                  .configFormat(format)
          );
        }));
  }

  @Override
  public Mono<ResponseEntity<Void>> restartWithConfig(Mono<RestartRequestDTO> configDtoMono,
                                                      ServerWebExchange exchange) {
    return accessControlService
        .validateAccess(
            AccessContext.builder()
                .applicationConfigActions(EDIT)
                .build()
        )
        .then(configDtoMono)
        .map(config -> {
          if (!validateConfig(config.getConfig())) {
            throw new ValidationException("Config is not a valid json/yaml");
          }
          doRestart(config.getConfig());
          return ResponseEntity.ok().build();
        });
  }

  private void doRestart(String config) {
    Thread thread = new Thread(() -> {
      closeApplicationContext(applicationContext);
      System.setProperty(SPRING_APPLICATION_JSON_PROPERTY, config);
      KafkaUiApplication.startApplication(new String[] {});
    });
    thread.setName("restartedMain-" + System.currentTimeMillis());
    thread.setDaemon(false);
    thread.start();
  }

  private void closeApplicationContext(ConfigurableApplicationContext ctx) {
    try {
      ctx.close();
    } catch (Exception e) {
      log.warn("Error stopping application before restart", e);
    }
  }

  private static boolean validateConfig(String configString) {
    try {
      var parsed = new Yaml().load(configString);
      return parsed instanceof Map;
    } catch (Exception e) {
      log.warn("Invalid json config ", e);
      return false;
    }
  }
}
