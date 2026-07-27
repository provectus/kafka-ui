package com.provectus.kafka.ui.service.account;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

  @Id
  private Long id;
  private String username;
  private String passwordHash;
  private boolean enabled;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

}
