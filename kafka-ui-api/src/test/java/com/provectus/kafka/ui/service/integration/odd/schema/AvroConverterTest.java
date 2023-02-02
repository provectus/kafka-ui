package com.provectus.kafka.ui.service.integration.odd.schema;

import com.provectus.kafka.ui.sr.model.SchemaSubject;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddrn.model.KafkaPath;

class AvroConverterTest {

  @Test
  void test() {
    var list = AvroConverter.extract(
        new SchemaSubject()
            .schema("""
                  {
                  	"type": "record",
                  	"name": "Message",
                  	"namespace": "com.provectus.kafka",
                  	"fields": [
                  	     {
                  	      "name": "f1" ,
                  	      "type" : {
                            "type": "array",
                            "items": {
                              "type": "record",
                              "name": "ArrElement",
                              "fields": [
                                      {
                                          "name": "age",
                                          "type": "long"
                                      },
                                      {
                                         "name": "longmap",
                                         "type": {
                                             "type": "map",
                                             "values": "long",
                                             "default": {}
                                         }
                                     }
                              ]
                            }
                          }
                  	     },
                  		 {
                  			"name": "f2",
                  			"type": {
                  				"type": "record",
                  				"name": "InnerMessage",
                  				"fields": [
                  					{
                  						"name": "text",
                  						"type": "string"
                  					},
                  					{
                  						"name": "innerMsgRef",
                  						"type":  "InnerMessage"
                  					},
                  					{
                  						"name": "nullable_union",
                  						"type": [
                  							"null",
                  							"string",
                  							"int"
                  						],
                  						"default": null
                  					},
                  					{
                  						"name": "nullable_string",
                  						"type": [
                  							"null",
                  							"string"
                  						],
                  						"default": null
                  					},
                  					{
                  						"name": "order",
                  						"type": {
                  							"type": "enum",
                  							"name": "Suit",
                  							"symbols": [
                  								"SPADES",
                  								"HEARTS"
                  							]
                  						}
                  					},
                  					{
                  						"name": "some_list",
                  						"type": {
                  							"type": "array",
                  							"items": "string",
                  							"default": []
                  						}
                  					}
                  				]
                  			}
                  		}
                  	]
                  }
                """),

        KafkaPath.builder()
            .host("localhost:9092")
            .topic("someTopic")
            .build()
    );


    System.out.println(list);
  }

}
