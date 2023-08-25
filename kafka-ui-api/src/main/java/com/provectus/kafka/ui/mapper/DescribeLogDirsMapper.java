package com.provectus.kafka.ui.mapper;

import com.provectus.kafka.ui.model.BrokerTopicLogdirsDTO;
import com.provectus.kafka.ui.model.BrokerTopicPartitionLogdirDTO;
import com.provectus.kafka.ui.model.BrokersLogdirsDTO;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.kafka.clients.admin.LogDirDescription;
import org.apache.kafka.clients.admin.ReplicaInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.protocol.Errors;
import org.apache.kafka.common.requests.DescribeLogDirsResponse;
import org.springframework.stereotype.Component;

@Component
public class DescribeLogDirsMapper {

  public List<BrokersLogdirsDTO> toBrokerLogDirsList(
      Map<Integer, Map<String, LogDirDescription>> logDirsInfo) {

    return logDirsInfo.entrySet().stream().map(
        mapEntry -> mapEntry.getValue().entrySet().stream()
            .map(e -> toBrokerLogDirs(mapEntry.getKey(), e.getKey(), e.getValue()))
            .collect(Collectors.toList())
    ).flatMap(Collection::stream).collect(Collectors.toList());
  }

  private BrokersLogdirsDTO toBrokerLogDirs(Integer broker, String dirName,
                                            LogDirDescription logDirInfo) {
    BrokersLogdirsDTO result = new BrokersLogdirsDTO();
    result.setName(dirName);
    if (logDirInfo.error() != null) {
      result.setError(logDirInfo.error().getMessage());
    }
    var topics = logDirInfo.replicaInfos().entrySet().stream()
        .collect(Collectors.groupingBy(e -> e.getKey().topic())).entrySet().stream()
        .map(e -> toTopicLogDirs(broker, e.getKey(), e.getValue()))
        .collect(Collectors.toList());
    result.setTopics(topics);
    return result;
  }

  private BrokerTopicLogdirsDTO toTopicLogDirs(Integer broker, String name,
                                               List<Map.Entry<TopicPartition, ReplicaInfo>> partitions) {
    BrokerTopicLogdirsDTO topic = new BrokerTopicLogdirsDTO();
    topic.setName(name);
    topic.setPartitions(
        partitions.stream().map(
            e -> topicPartitionLogDir(
                broker, e.getKey().partition(), e.getValue())).collect(Collectors.toList())
    );
    return topic;
  }

  private BrokerTopicPartitionLogdirDTO topicPartitionLogDir(Integer broker, Integer partition,
                                                             ReplicaInfo replicaInfo) {
    BrokerTopicPartitionLogdirDTO logDir = new BrokerTopicPartitionLogdirDTO();
    logDir.setBroker(broker);
    logDir.setPartition(partition);
    logDir.setSize(replicaInfo.size());
    logDir.setOffsetLag(replicaInfo.offsetLag());
    return logDir;
  }
}
