package com.provectus.kafka.ui.service.metrics.v2.scrape.inferred;

import com.provectus.kafka.ui.service.metrics.v2.scrape.inferred.states.ConsumerGroupsState;
import com.provectus.kafka.ui.service.metrics.v2.scrape.inferred.states.TopicsState;
import java.time.Instant;
import lombok.Value;

@Value
public class ScrapedClusterState {

  Instant scrapeStart;
  TopicsState topicsState;
  ConsumerGroupsState consumerGroupsState;

  public static ScrapedClusterState empty() {
    return new ScrapedClusterState(null, null, null);
  }

}
