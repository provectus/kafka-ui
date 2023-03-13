package com.provectus.kafka.ui.util;

import com.provectus.kafka.ui.KafkaUiApplication;
import java.io.Closeable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ApplicationRestarter implements ApplicationListener<ApplicationStartedEvent> {

  private String[] applicationArgs;
  private ApplicationContext applicationContext;

  @Override
  public void onApplicationEvent(ApplicationStartedEvent event) {
    this.applicationArgs = event.getArgs();
    this.applicationContext = event.getApplicationContext();
  }

  public void requestRestart() {
    log.info("Restarting application");
    Thread thread = new Thread(() -> {
      closeApplicationContext(applicationContext);
      KafkaUiApplication.startApplication(applicationArgs);
    });
    thread.setName("restartedMain-" + System.currentTimeMillis());
    thread.setDaemon(false);
    thread.start();
  }

  private void closeApplicationContext(ApplicationContext context) {
    while (context instanceof Closeable) {
      try {
        ((Closeable) context).close();
      } catch (Exception e) {
        log.warn("Error stopping application before restart", e);
        throw new RuntimeException(e);
      }
      context = context.getParent();
    }
  }
}
