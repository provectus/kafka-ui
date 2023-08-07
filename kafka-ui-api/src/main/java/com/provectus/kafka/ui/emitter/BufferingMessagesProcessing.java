package com.provectus.kafka.ui.emitter;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.model.TopicMessageEventDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import reactor.core.publisher.FluxSink;


public class BufferingMessagesProcessing extends MessagesProcessing {

  private final List<TopicMessageDTO> buffer = new ArrayList<>();

  private final Comparator<TopicMessageDTO> comparator;

  public BufferingMessagesProcessing(ConsumerRecordDeserializer deserializer,
                                     Predicate<TopicMessageDTO> filter,
                                     Comparator<TopicMessageDTO> comparator,
                                     @Nullable Integer limit) {
    super(deserializer, filter, limit);
    this.comparator = comparator;
  }

  void buffer(ConsumerRecord<Bytes, Bytes> rec) {
    //TODO
  }

  void flush(FluxSink<TopicMessageEventDTO> sink) {
    //TODO
  }

}
