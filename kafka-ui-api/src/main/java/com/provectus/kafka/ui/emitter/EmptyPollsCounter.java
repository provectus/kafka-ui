package com.provectus.kafka.ui.emitter;

import org.apache.kafka.clients.consumer.ConsumerRecords;

// In some situations it is hard to say whether records range (between two offsets) was fully polled.
// This happens when we have holes in records sequences that is usual case for compact topics or
// topics with transactional writes. In such cases if you want to poll all records between offsets X and Y
// there is no guarantee that you will ever see record with offset Y.
// To workaround this we can assume that after N consecutive empty polls all target messages were read.
public class EmptyPollsCounter {

  private final int maxEmptyPolls;

  private int emptyPolls = 0;

  EmptyPollsCounter(int maxEmptyPolls) {
    this.maxEmptyPolls = maxEmptyPolls;
  }

  public void count(ConsumerRecords<?, ?> polled) {
    emptyPolls = polled.isEmpty() ? emptyPolls + 1 : 0;
  }

  public boolean noDataEmptyCountsReached() {
    return emptyPolls >= maxEmptyPolls;
  }

}
