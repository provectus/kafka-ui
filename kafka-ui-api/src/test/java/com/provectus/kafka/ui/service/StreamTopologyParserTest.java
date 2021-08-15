package com.provectus.kafka.ui.service;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.provectus.kafka.ui.exception.InvalidStreamTopologyString;
import com.provectus.kafka.ui.service.topology.parser.StreamTopologyParser;
import com.provectus.kafka.ui.service.topology.parser.StreamTopologyParserHelper;
import org.junit.jupiter.api.Test;

class StreamTopologyParserTest {
  private final StreamTopologyParser parser =
      new StreamTopologyParser(new StreamTopologyParserHelper());

  @Test
  void edgeCasesTest() {
    assertThrows(InvalidStreamTopologyString.class, () -> parser.parse(""));
    assertThrows(InvalidStreamTopologyString.class, () -> parser.parse(null));
    assertThrows(InvalidStreamTopologyString.class, () -> parser.parse("invalid topology"));
    assertThrows(InvalidStreamTopologyString.class,
        () -> parser.parse("Topologies:\n" + "   Sub-topology: 0"));
    assertThrows(InvalidStreamTopologyString.class,
        () -> parser.parse(
            "Topologies:\n" +
                "    Processor: KSTREAM-KEY-SELECT-0000000002 (stores: [])\n" +
                "      --> KSTREAM-KEY-SELECT-0000000002-repartition-filter\n" +
                "      <-- KSTREAM-SOURCE-0000000000\n" +
                "    Processor: KSTREAM-KEY-SELECT-0000000002-repartition-filter (stores: [])\n" +
                "      --> KSTREAM-KEY-SELECT-0000000002-repartition-sink\n" +
                "      <-- KSTREAM-KEY-SELECT-0000000002"));
  }
}