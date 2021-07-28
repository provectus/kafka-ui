package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.model.BrokerTopicLogdirs;
import com.provectus.kafka.ui.model.BrokerTopicPartitionLogdir;
import com.provectus.kafka.ui.model.BrokersLogdirs;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import org.springframework.stereotype.Component;

@Component
public class DescribeLogDirsMapper {

  public List<BrokersLogdirs> toBrokerLogDirsList(
      Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>> logDirsInfo) {

    return logDirsInfo.entrySet().stream().map(
        mapEntry -> mapEntry.getValue().entrySet().stream()
            .map(e -> toBrokerLogDirs(mapEntry.getKey(), e.getKey(), e.getValue()))
            .collect(Collectors.toList())
    ).flatMap(Collection::stream).collect(Collectors.toList());
  }

  private BrokersLogdirs toBrokerLogDirs(Integer broker, String dirName,
                                         DescribeLogDirsResponse.LogDirInfo logDirInfo) {
    BrokersLogdirs result = new BrokersLogdirs();
    result.setName(dirName);
    if (logDirInfo.error != null) {
      result.setError(logDirInfo.error.message());
    }
    var topics = logDirInfo.replicaInfos.entrySet().stream()
        .collect(Collectors.groupingBy(e -> e.getKey().topic())).entrySet().stream()
        .map(e -> toTopicLogDirs(broker, e.getKey(), e.getValue()))
        .collect(Collectors.toList());
    result.setTopics(topics);
    return result;
  }

  private BrokerTopicLogdirs toTopicLogDirs(Integer broker, String name,
                                            List<Map.Entry<TopicPartition,
                                            DescribeLogDirsResponse.ReplicaInfo>> partitions) {
    BrokerTopicLogdirs topic = new BrokerTopicLogdirs();
    topic.setName(name);
    topic.setPartitions(
        partitions.stream().map(
            e -> topicPartitionLogDir(
                broker, e.getKey().partition(), e.getValue())).collect(Collectors.toList())
    );
    return topic;
  }

  private BrokerTopicPartitionLogdir topicPartitionLogDir(Integer broker, Integer partition,
                                                          DescribeLogDirsResponse.ReplicaInfo
                                                              replicaInfo) {
    BrokerTopicPartitionLogdir logDir = new BrokerTopicPartitionLogdir();
    logDir.setBroker(broker);
    logDir.setPartition(partition);
    logDir.setSize(replicaInfo.size);
    logDir.setOffsetLag(replicaInfo.offsetLag);
    return logDir;
  }
}
