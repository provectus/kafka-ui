package com.provectus.kafka.ui.service.reassign;

import static org.assertj.core.api.Assertions.assertThat;

import com.provectus.kafka.ui.model.ReassignPartitionsCommandDTO;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReassignmentJsonDtoTest {

  @Test
  void canBeCreatedFromJsonString() {
    var parsed = ReassignmentJsonDto.fromJson(
        "{" +
            "    \"version\": 1, " +
            "    \"partitions\":" +
            "    [" +
            "        {" +
            "            \"topic\": \"my-topic\"," +
            "            \"partition\": 0, " +
            "            \"replicas\":" +
            "            [ " +
            "                0, " +
            "                1, " +
            "                2 " +
            "            ], " +
            "            \"log_dirs\": " +
            "            [ " +
            "                \"any\", " +
            "                \"/user/share/kafka/p0\"," +
            "                \"any\"" +
            "            ]" +
            "        }" +
            "    ]" +
            "}"
    );
    assertThat(parsed).isEqualTo(
      ReassignPartitionsCommandDTO.builder()
          .version(1)
          .partitions(
              List.of(
                  ReassignmentJsonDto.PartitionAssignmentDto.builder()
                      .topic("my-topic")
                      .partition(0)
                      .replicas(List.of(0, 1, 2))
                      .logDirs(List.of("any", "/user/share/kafka/p0", "any"))
                      .build()
              )
          )
          .build()
    );
  }


}
