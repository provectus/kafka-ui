package com.provectus.kafka.ui.controller;

import com.provectus.kafka.ui.api.GraphsApi;
import com.provectus.kafka.ui.model.GraphDataRequestDTO;
import com.provectus.kafka.ui.model.GraphDescriptionDTO;
import com.provectus.kafka.ui.model.GraphDescriptionsDTO;
import com.provectus.kafka.ui.model.PrometheusApiQueryResponseDTO;
import com.provectus.kafka.ui.model.PrometheusApiQueryResponseDataDTO;
import com.provectus.kafka.ui.model.rbac.AccessContext;
import com.provectus.kafka.ui.model.rbac.permission.KsqlAction;
import com.provectus.kafka.ui.service.AdminClientService;
import com.provectus.kafka.ui.service.graphs.GraphsService;
import com.provectus.kafka.ui.service.audit.AuditService;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import prometheus.query.model.QueryResponse;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class GraphsController extends AbstractController implements GraphsApi {

  private static final PrometheusApiMapper MAPPER = Mappers.getMapper(PrometheusApiMapper.class);

  @Mapper
  interface PrometheusApiMapper {
    PrometheusApiQueryResponseDTO fromClientResponse(QueryResponse resp);
  }

  private final AccessControlService accessControlService;
  private final AuditService auditService;
  private final GraphsService graphsService;

  @Override
  public Mono<ResponseEntity<PrometheusApiQueryResponseDTO>> getGraphData(String clusterName,
                                                                          Mono<GraphDataRequestDTO> graphDataRequestDTO,
                                                                          ServerWebExchange exchange) {
    var context = AccessContext.builder()
        .cluster(clusterName)
        .operationName("getGraphData")
        .build();

    return accessControlService.validateAccess(context)
        .then(
            graphDataRequestDTO.flatMap(req ->
                    graphsService.getGraphData(
                        getCluster(clusterName),
                        req.getId(),
                        Optional.ofNullable(req.getFrom()).map(OffsetDateTime::toInstant).orElse(null),
                        Optional.ofNullable(req.getTo()).map(OffsetDateTime::toInstant).orElse(null),
                        req.getParameters()
                    ).map(MAPPER::fromClientResponse))
                .map(ResponseEntity::ok)
        ).doOnEach(sig -> auditService.audit(context, sig));
  }

  @Override
  public Mono<ResponseEntity<GraphDescriptionsDTO>> getGraphsList(String clusterName,
                                                                  ServerWebExchange exchange) {
    var graphs = graphsService.getAllGraphs().toList();
    var cluster = getCluster(clusterName);
    if (cluster.getPrometheusStorageClient() == null) {
      graphs = List.of();
    }
    return Mono.just(
        ResponseEntity.ok(
            new GraphDescriptionsDTO().graphs(graphs)
        )
    );
  }
}
