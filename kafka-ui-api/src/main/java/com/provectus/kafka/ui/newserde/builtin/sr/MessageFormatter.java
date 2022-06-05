package com.provectus.kafka.ui.newserde.builtin.sr;

interface MessageFormatter {
  String format(String topic, byte[] value);
}
