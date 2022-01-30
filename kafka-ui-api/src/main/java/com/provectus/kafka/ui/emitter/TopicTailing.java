package com.provectus.kafka.ui.emitter;

import static java.lang.System.currentTimeMillis;
import static java.util.stream.Collectors.toList;

import com.google.common.util.concurrent.RateLimiter;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.model.TopicMessagePhaseDTO;
import com.provectus.kafka.ui.serde.RecordSerDe;
import com.provectus.kafka.ui.util.ClusterUtil;
import java.time.Duration;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.InterruptException;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.core.scheduler.Schedulers;

@Slf4j
@RequiredArgsConstructor
public class TopicTailing {

  private static final Duration POLL_TIMEOUT = Duration.ofSeconds(1);

  private final RecordSerDe serde;
  private final Function<Map<String, Object>, KafkaConsumer<Bytes, Bytes>> consumerSupplier;
  private final Predicate<TopicMessageEventDTO> msgFilter;
  private final int maxEmitRatePerSec;

  public Flux<TopicMessageEventDTO> tail(String topic,
                                         Map<TopicPartition, Long> offsets) {
    return Flux.<TopicMessageEventDTO>create(sink -> {
      try (var consumer = createConsumer()) {
        seekAndAssign(consumer, topic, offsets);
        poll(consumer, sink);
        sink.complete();
      } catch (InterruptException kafkaInterruptException) {
        sink.complete();
      } catch (Exception e) {
        log.error("Error while tailing topic {}", topic, e);
        sink.error(e);
      }
    }).subscribeOn(Schedulers.boundedElastic());
  }

  private void poll(KafkaConsumer<Bytes, Bytes> consumer,
                    FluxSink<TopicMessageEventDTO> sink) {
    var rateLimiter = RateLimiter.create(maxEmitRatePerSec);
    boolean throttlingEventSent = false;
    var consumingStats = new ConsumingStats();

    while (!sink.isCancelled()) {
      long beforePoll = currentTimeMillis();
      var polled = consumer.poll(POLL_TIMEOUT);
      consumingStats.sendConsumingEvt(sink, polled, currentTimeMillis() - beforePoll);
      for (var rec : polled) {
        var message = parseRecord(rec);
        if (msgFilter.test(message)) {
          if (rateLimiter.acquire() > 0 && !throttlingEventSent) {
            throttlingEventSent = true;
            sendThrottlingEvent(sink);
          }
          sink.next(message);
        }
      }
    }
  }

  private KafkaConsumer<Bytes, Bytes> createConsumer() {
    return consumerSupplier.apply(
        Map.of(
            ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest",
            ConsumerConfig.MAX_POLL_RECORDS_CONFIG, maxEmitRatePerSec));
  }

  private TopicMessageEventDTO parseRecord(ConsumerRecord<Bytes, Bytes> rec) {
    return new TopicMessageEventDTO()
        .type(TopicMessageEventDTO.TypeEnum.MESSAGE)
        .message(ClusterUtil.mapToTopicMessage(rec, serde));
  }

  private void seekAndAssign(KafkaConsumer<?, ?> consumer,
                             String topic,
                             Map<TopicPartition, Long> offsets) {
    if (offsets.isEmpty()) {
      consumer.assign(
          consumer.partitionsFor(topic).stream()
              .map(p -> new TopicPartition(p.topic(), p.partition()))
              .collect(toList())
      );
    } else {
      consumer.assign(offsets.keySet());
      offsets.forEach(consumer::seek);
    }
  }

  private void sendThrottlingEvent(FluxSink<TopicMessageEventDTO> sink) {
    sink.next(
        new TopicMessageEventDTO()
            .phase(new TopicMessagePhaseDTO().name(
                String.format("Messages rate is too high, throttling to %d messages/sec",
                    maxEmitRatePerSec)))
            .type(TopicMessageEventDTO.TypeEnum.EMIT_THROTTLING)
    );
  }

}
