package com.provectus.kafka.ui.service.metrics;

import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;
import static org.apache.commons.lang3.StringUtils.endsWithIgnoreCase;

import com.provectus.kafka.ui.model.Metrics;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.common.Node;

class WellKnownMetrics {

  private static final String BROKER_TOPIC_METRICS = "BrokerTopicMetrics";
  private static final String MEAN_RATE = "MeanRate";
  private static final String ONE_MINUTE_RATE = "OneMinuteRate";
  private static final String FIVE_MINUTE_RATE = "FiveMinuteRate";
  private static final String FIFTEEN_MINUTE_RATE = "FifteenMinuteRate";

  // per broker
  final Map<Integer, BigDecimal> brokerBytesInFifteenMinuteRate = new HashMap<>();
  final Map<Integer, BigDecimal> brokerBytesOutFifteenMinuteRate = new HashMap<>();

  // per topic
  final Map<String, BigDecimal> bytesInFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> bytesOutFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> messageInMeanRate = new HashMap<>();
  final Map<String, BigDecimal> messageInOneMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> messageInFiveMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> messageInFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> fetchRequestsMeanRate = new HashMap<>();
  final Map<String, BigDecimal> fetchRequestsOneMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> fetchRequestsFiveMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> fetchRequestsFifteenMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> produceRequestsMeanRate = new HashMap<>();
  final Map<String, BigDecimal> produceRequestsOneMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> produceRequestsFiveMinuteRate = new HashMap<>();
  final Map<String, BigDecimal> produceRequestsFifteenMinuteRate = new HashMap<>();

  void populate(Node node, RawMetric rawMetric) {
    updateBrokerIOrates(node, rawMetric);
    updateTopicsIOrates(rawMetric);
  }

  void apply(Metrics.MetricsBuilder metricsBuilder) {
    metricsBuilder.topicBytesInPerSec(bytesInFifteenMinuteRate);
    metricsBuilder.topicBytesOutPerSec(bytesOutFifteenMinuteRate);
    metricsBuilder.brokerBytesInPerSec(brokerBytesInFifteenMinuteRate);
    metricsBuilder.brokerBytesOutPerSec(brokerBytesOutFifteenMinuteRate);
    metricsBuilder.messageInMeanRate(messageInMeanRate);
	metricsBuilder.messageInOneMinuteRate(messageInOneMinuteRate);
	metricsBuilder.messageInFiveMinuteRate(messageInFiveMinuteRate);
	metricsBuilder.messageInFifteenMinuteRate(messageInFifteenMinuteRate);
	metricsBuilder.fetchRequestsMeanRate(fetchRequestsMeanRate);
	metricsBuilder.fetchRequestsOneMinuteRate(fetchRequestsOneMinuteRate);
	metricsBuilder.fetchRequestsFiveMinuteRate(fetchRequestsFiveMinuteRate);
	metricsBuilder.fetchRequestsFifteenMinuteRate(fetchRequestsFifteenMinuteRate);
	metricsBuilder.produceRequestsMeanRate(produceRequestsMeanRate);
	metricsBuilder.produceRequestsOneMinuteRate(produceRequestsOneMinuteRate);
	metricsBuilder.produceRequestsFiveMinuteRate(produceRequestsFiveMinuteRate);
	metricsBuilder.produceRequestsFifteenMinuteRate(produceRequestsFifteenMinuteRate);
  }

  private void updateBrokerIOrates(Node node, RawMetric rawMetric) {
    String name = rawMetric.name();
    if (!brokerBytesInFifteenMinuteRate.containsKey(node.id())
        && rawMetric.labels().size() == 1
        && "BytesInPerSec".equalsIgnoreCase(rawMetric.labels().get("name"))
        && containsIgnoreCase(name, BROKER_TOPIC_METRICS)
        && endsWithIgnoreCase(name, FIFTEEN_MINUTE_RATE)) {
      brokerBytesInFifteenMinuteRate.put(node.id(),  rawMetric.value());
    }
    if (!brokerBytesOutFifteenMinuteRate.containsKey(node.id())
        && rawMetric.labels().size() == 1
        && "BytesOutPerSec".equalsIgnoreCase(rawMetric.labels().get("name"))
        && containsIgnoreCase(name, BROKER_TOPIC_METRICS)
        && endsWithIgnoreCase(name, FIFTEEN_MINUTE_RATE)) {
      brokerBytesOutFifteenMinuteRate.put(node.id(), rawMetric.value());
    }
  }

  private void updateTopicsIOrates(RawMetric rawMetric) {
	String name = rawMetric.name();
	String topic = rawMetric.labels().get("topic");
	if (topic != null && containsIgnoreCase(name, BROKER_TOPIC_METRICS)) {
	  if (endsWithIgnoreCase(name, MEAN_RATE)) {
		String nameProperty = rawMetric.labels().get("name");
		if ("MessagesInPerSec".equalsIgnoreCase(nameProperty)) {
		  messageInMeanRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalFetchRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  fetchRequestsMeanRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalProduceRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  produceRequestsMeanRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		}
	  }else if (endsWithIgnoreCase(name, ONE_MINUTE_RATE)) {
		String nameProperty = rawMetric.labels().get("name");
		if ("MessagesInPerSec".equalsIgnoreCase(nameProperty)) {
		  messageInOneMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalFetchRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  fetchRequestsOneMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalProduceRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  produceRequestsOneMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		}
	  }else if (endsWithIgnoreCase(name, FIVE_MINUTE_RATE)) {
		String nameProperty = rawMetric.labels().get("name");
		if ("MessagesInPerSec".equalsIgnoreCase(nameProperty)) {
		  messageInFiveMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalFetchRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  fetchRequestsFiveMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalProduceRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  produceRequestsFiveMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		}
	  }else if (endsWithIgnoreCase(name, FIFTEEN_MINUTE_RATE)) {
		String nameProperty = rawMetric.labels().get("name");
		if ("BytesInPerSec".equalsIgnoreCase(nameProperty)) {
		  bytesInFifteenMinuteRate.compute(topic,
			    (k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("BytesOutPerSec".equalsIgnoreCase(nameProperty)) {
		  bytesOutFifteenMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("MessagesInPerSec".equalsIgnoreCase(nameProperty)) {
		  messageInFifteenMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalFetchRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  fetchRequestsFifteenMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		} else if ("TotalProduceRequestsPerSec".equalsIgnoreCase(nameProperty)) {
		  produceRequestsFifteenMinuteRate.compute(topic,
				(k, v) -> v == null ? rawMetric.value() : v.add(rawMetric.value()));
		}
	  }
	}
  }

}
