package com.provectus.kafka.ui.service.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("user_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleEntity {

  @Id
  private Long id;
  private Long userId;
  private String roleName;

}
