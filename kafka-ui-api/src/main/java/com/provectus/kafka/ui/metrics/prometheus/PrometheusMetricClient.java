package com.provectus.kafka.ui.metrics.prometheus;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.List;

import org.springframework.web.reactive.function.client.WebClient;

import com.provectus.kafka.ui.model.Metric;

import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Log4j2
public class PrometheusMetricClient {

	private final WebClient webClient;
	private final PrometheusMetricParser metricParser;

	public Mono<List<Metric>> getMetrics() {
		return webClient
				.get()
				.retrieve()
				.bodyToMono(String.class)
				.flatMapIterable(metricParser::parse)
				.map(this::metricGroupToMetric)
				.collectList();
	}

	private Metric metricGroupToMetric(MetricGroup metricGroup) {
		return null;
	}
}
