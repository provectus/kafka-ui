package com.provectus.kafka.ui.service;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.provectus.kafka.ui.emitter.Cursor;
import com.provectus.kafka.ui.model.ConsumerPosition;
import com.provectus.kafka.ui.model.TopicMessageDTO;
import com.provectus.kafka.ui.serdes.ConsumerRecordDeserializer;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import org.apache.commons.lang3.RandomStringUtils;

public class PollingCursorsStorage {

  public static final int MAX_SIZE = 10_000;

  private final Cache<String, Cursor> cursorsCache = CacheBuilder.newBuilder()
      .maximumSize(MAX_SIZE)
      .build();


  public Cursor.Tracking createNewCursor(ConsumerRecordDeserializer deserializer,
                                         ConsumerPosition originalPosition,
                                         Predicate<TopicMessageDTO> filter,
                                         int limit) {
    return new Cursor.Tracking(deserializer, originalPosition, filter, limit, this::register);
  }

  public Optional<Cursor> getCursor(String id) {
    return Optional.ofNullable(cursorsCache.getIfPresent(id));
  }

  public String register(Cursor cursor) {
    var id = RandomStringUtils.random(8, true, true);
    cursorsCache.put(id, cursor);
    return id;
  }

  @VisibleForTesting
  public Map<String, Cursor> asMap() {
    return cursorsCache.asMap();
  }
}
