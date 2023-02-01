package com.provectus.kafka.ui.pages.ksqldb.models;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Table {
  private String name, streamName;
}
