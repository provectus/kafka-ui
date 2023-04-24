package com.provectus.kafka.ui.service;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.provectus.kafka.ui.emitter.Cursor;
import java.util.Map;
import java.util.Optional;
import org.apache.commons.lang3.RandomStringUtils;

public class PollingCursorsStorage {

  private final Cache<String, Cursor> cursorsCache = CacheBuilder.newBuilder()
      .maximumSize(10_000)
      .build();

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
