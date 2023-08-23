package com.provectus.kafka.ui.serdes;

import static com.provectus.kafka.ui.serde.api.DeserializeResult.Type.STRING;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serde.api.DeserializeResult;
import com.provectus.kafka.ui.serde.api.Serde;
import java.util.Map;
import java.util.function.UnaryOperator;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

class ConsumerRecordDeserializerTest {

  @Test
  void dataMaskingAppliedOnDeserializedMessage() {
    UnaryOperator<TopicMessageDTO> maskerMock = mock();
    Serde.Deserializer deser = (headers, data) -> new DeserializeResult("test", STRING, Map.of());

    var recordDeser = new ConsumerRecordDeserializer("test", deser, "test", deser, "test", deser, deser, maskerMock);
    recordDeser.deserialize(new ConsumerRecord<>("t", 1, 1L, Bytes.wrap("t".getBytes()), Bytes.wrap("t".getBytes())));

    verify(maskerMock).apply(any(TopicMessageDTO.class));
  }

}
