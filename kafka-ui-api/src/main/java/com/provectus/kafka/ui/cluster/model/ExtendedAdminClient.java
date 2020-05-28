package com.provectus.kafka.ui.cluster.model;

import com.provectus.kafka.ui.cluster.util.ClusterUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import reactor.core.publisher.Mono;

import java.util.Set;

@Data
@RequiredArgsConstructor
public class ExtendedAdminClient {

    private final AdminClient adminClient;
    private final Set<SupportedFeature> supportedFeatures;

    public enum SupportedFeature {
        INCREMENTAL_ALTER_CONFIGS,
        ALTER_CONFIGS
    }

    public static Mono<ExtendedAdminClient> extendedAdminClient(AdminClient adminClient) {
        return ClusterUtil.getSupportedFeatures(adminClient)
                .map(s -> new ExtendedAdminClient(adminClient, s));
    }
}
