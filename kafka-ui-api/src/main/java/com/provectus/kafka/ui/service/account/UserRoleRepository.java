package com.provectus.kafka.ui.service.account;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserRoleRepository extends ReactiveCrudRepository<UserRoleEntity, Long> {

  Flux<UserRoleEntity> findByUserId(Long userId);

  Mono<Void> deleteByUserId(Long userId);

}
