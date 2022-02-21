package com.provectus.kafka.ui.util;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class CompletableFutureUtil {
  public static <T> CompletableFuture<List<T>> all(List<CompletableFuture<T>> cfs) {
    CompletableFuture<Void> allFutures = CompletableFuture
        .allOf(cfs.toArray(new CompletableFuture[0]));

    return allFutures.thenApply(future -> {
      return cfs.stream()
          .map(CompletableFuture::join)
          .collect(Collectors.toList());
    });
  }
}
