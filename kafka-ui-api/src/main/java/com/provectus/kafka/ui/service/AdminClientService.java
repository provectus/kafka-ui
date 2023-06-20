package com.provectus.kafka.ui.service;

import com.provectus.kafka.ui.model.KafkaCluster;
import reactor.core.publisher.Mono;

public interface AdminClientService {

  Mono<ReactiveAdminClient> get(KafkaCluster cluster);

}
