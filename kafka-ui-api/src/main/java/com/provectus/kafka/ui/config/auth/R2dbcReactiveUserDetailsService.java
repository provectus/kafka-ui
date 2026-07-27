package com.provectus.kafka.ui.config.auth;

import com.provectus.kafka.ui.service.account.UserRepository;
import com.provectus.kafka.ui.service.account.UserRoleEntity;
import com.provectus.kafka.ui.service.account.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class R2dbcReactiveUserDetailsService implements ReactiveUserDetailsService {

  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;

  @Override
  public Mono<UserDetails> findByUsername(String username) {
    return userRepository.findByUsername(username)
        .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found: " + username)))
        .flatMap(user -> userRoleRepository.findByUserId(user.getId())
            .map(UserRoleEntity::getRoleName)
            .collectList()
            .map(roles -> new RbacLoginFormUser(user.getUsername(), user.getPasswordHash(), user.isEnabled(), roles)))
        .map(UserDetails.class::cast);
  }

}
