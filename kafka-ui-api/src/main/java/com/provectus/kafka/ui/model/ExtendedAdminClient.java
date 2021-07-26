package com.provectus.kafka.ui.model;

import com.provectus.kafka.ui.util.ClusterUtil;
import java.util.Set;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import reactor.core.publisher.Mono;

@Data
@RequiredArgsConstructor
public class ExtendedAdminClient {

  private final AdminClient adminClient;
  private final Set<SupportedFeature> supportedFeatures;

  public static Mono<ExtendedAdminClient> extendedAdminClient(AdminClient adminClient) {

    return ClusterUtil.getSupportedFeatures(adminClient)
        .map(s -> new ExtendedAdminClient(adminClient, s));
  }

  public enum SupportedFeature {
    INCREMENTAL_ALTER_CONFIGS,
    ALTER_CONFIGS
  }
}
