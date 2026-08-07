package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.model.UserDTO;
import com.provectus.kafka.ui.service.account.Account;

public final class AccountMapper {

  private AccountMapper() {
  }

  public static UserDTO toDto(Account account) {
    return new UserDTO(account.id(), account.username(), account.enabled(), account.roles());
  }

}
