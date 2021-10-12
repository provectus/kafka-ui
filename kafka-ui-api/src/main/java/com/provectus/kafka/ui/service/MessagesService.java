package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.exception.TopicNotFoundException;
import com.provectus.kafka.ui.exception.ValidationException;
import com.provectus.kafka.ui.model.CreateTopicMessageDTO;
import com.provectus.kafka.ui.model.KafkaCluster;
import com.provectus.kafka.ui.serde.DeserializationService;
import com.provectus.kafka.ui.serde.RecordSerDe;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.apache.kafka.common.header.internals.RecordHeaders;
import org.apache.kafka.common.serialization.ByteArraySerializer;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Log4j2
public class MessagesService {

  private final AdminClientService adminClientService;
  private final DeserializationService deserializationService;
  private final ConsumerGroupService consumerGroupService;

  public Mono<Void> deleteTopicMessages(KafkaCluster cluster, String topicName,
                                        List<Integer> partitionsToInclude) {
    if (!cluster.getTopics().containsKey(topicName)) {
      throw new TopicNotFoundException();
    }
    return offsetsForDeletion(cluster, topicName, partitionsToInclude)
        .flatMap(offsets ->
            adminClientService.get(cluster).flatMap(ac -> ac.deleteRecords(offsets)));
  }

  private Mono<Map<TopicPartition, Long>> offsetsForDeletion(KafkaCluster cluster, String topicName,
                                                            List<Integer> partitionsToInclude) {
    return Mono.fromSupplier(() -> {
      try (KafkaConsumer<Bytes, Bytes> consumer = consumerGroupService.createConsumer(cluster)) {
        return ConsumingService.significantOffsets(consumer, topicName, partitionsToInclude);
      } catch (Exception e) {
        log.error("Error occurred while consuming records", e);
        throw new RuntimeException(e);
      }
    });
  }

  public Mono<RecordMetadata> sendMessage(KafkaCluster cluster, String topic,
                                          CreateTopicMessageDTO msg) {
    if (msg.getKey() == null && msg.getContent() == null) {
      throw new ValidationException("Invalid message: both key and value can't be null");
    }
    if (msg.getPartition() != null
        && msg.getPartition() > cluster.getTopics().get(topic).getPartitionCount() - 1) {
      throw new ValidationException("Invalid partition");
    }
    RecordSerDe serde =
        deserializationService.getRecordDeserializerForCluster(cluster);

    Properties properties = new Properties();
    properties.putAll(cluster.getProperties());
    properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, cluster.getBootstrapServers());
    properties.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, ByteArraySerializer.class);
    properties.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, ByteArraySerializer.class);
    try (KafkaProducer<byte[], byte[]> producer = new KafkaProducer<>(properties)) {
      ProducerRecord<byte[], byte[]> producerRecord = serde.serialize(
          topic,
          msg.getKey(),
          msg.getContent(),
          msg.getPartition()
      );
      producerRecord = new ProducerRecord<>(
          producerRecord.topic(),
          producerRecord.partition(),
          producerRecord.key(),
          producerRecord.value(),
          createHeaders(msg.getHeaders()));

      CompletableFuture<RecordMetadata> cf = new CompletableFuture<>();
      producer.send(producerRecord, (metadata, exception) -> {
        if (exception != null) {
          cf.completeExceptionally(exception);
        } else {
          cf.complete(metadata);
        }
      });
      return Mono.fromFuture(cf);
    }
  }

  private Iterable<Header> createHeaders(Map<String, String> clientHeaders) {
    if (clientHeaders == null) {
      return null;
    }
    RecordHeaders headers = new RecordHeaders();
    clientHeaders.forEach((k, v) -> headers.add(new RecordHeader(k, v.getBytes())));
    return headers;
  }

}
