package com.provectus.kafka.ui.serde.api;

public interface RecordHeader {

  String key();

  byte[] value();

}
