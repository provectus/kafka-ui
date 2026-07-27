package com.provectus.kafka.ui.service.account;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveCrudRepository<UserEntity, Long> {

  Mono<UserEntity> findByUsername(String username);

  Mono<Boolean> existsByUsername(String username);

}
