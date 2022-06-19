package com.provectus.kafka.ui.serdes.builtin.sr;

interface MessageFormatter {
  String format(String topic, byte[] value);
}
