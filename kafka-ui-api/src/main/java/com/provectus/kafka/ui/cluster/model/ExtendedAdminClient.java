package com.provectus.kafka.ui.cluster.model;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;

import java.util.List;

@Data
@RequiredArgsConstructor
public class ExtendedAdminClient {

    private final AdminClient adminClient;
    private final List<SupportedFeatures> supportedFeatures;

    public enum SupportedFeatures {
        INCREMENTAL_ALTER_CONFIGS,
        ALTER_CONFIGS
    }
}
