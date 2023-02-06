package com.provectus.kafka.ui.service.integration.odd.schema;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class JsonSchemaExtractorTest {

  @Test
  void test() {
    String jsonSchema = """
        {
        	"$id": "http://example.com/test.TestMsggg",
        	"$schema": "https://json-schema.org/draft/2020-12/schema",
        	"type": "object",
        	"properties": {
        		"enum_field": {
        			"enum": [
        				"ENUM_V1",
        				"ENUM_V2"
        			],
        			"type": "string"
        		}
        	}
        }""";

    var fields = JsonSchemaExtractor.extract(
        new SchemaSubject().schema(jsonSchema),
        KafkaPath.builder()
            .host("localhost:9092")
            .topic("some-topic")
            .build()
    );
    System.out.println(fields);
  }
}
