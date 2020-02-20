package com.provectus.kafka.ui.jmx;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import com.provectus.kafka.ui.model.ServerStatus;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.management.ObjectInstance;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@Log4j2
@RequiredArgsConstructor
public class JmxService {

    @SneakyThrows
    @Async
    public void loadClusterMetrics(KafkaCluster kafkaCluster) {
        log.debug("Start getting JMX metrics for kafkaCluster: " + kafkaCluster.getName());
        boolean isConnected = false;
        if (kafkaCluster.getMBeanServerConnection() != null) {
            isConnected = isJmxConnected(kafkaCluster);
        }
        if (kafkaCluster.getMBeanServerConnection() == null || !isConnected) {
            isConnected = createJmxConnection(kafkaCluster);
        }

        if (!isConnected) {
            kafkaCluster.setJmxStatus(ServerStatus.OFFLINE);

            return;
        }

        kafkaCluster.setJmxStatus(ServerStatus.ONLINE);
        loadJmxClusterMetrics(kafkaCluster);
        loadJmxTopicMetrics(kafkaCluster);
    }

    @SneakyThrows
    private void loadJmxTopicMetrics(KafkaCluster kafkaCluster) {
        Set<ObjectInstance> objectInstances = kafkaCluster.getMBeanServerConnection().queryMBeans(new ObjectName(
                "kafka.cluster:type=Partition,name=UnderReplicated,topic=*,partition=*"), null);
        Map<String, Integer> topicUrpMap = new HashMap<>();
        for (ObjectInstance objectInstance : objectInstances) {
            String topicName = objectInstance.getObjectName().getKeyProperty("topic");
            if (topicName != null) {
                topicUrpMap.putIfAbsent(topicName, 0);
                Object attributeValue = kafkaCluster.getMBeanServerConnection().getAttribute(objectInstance.getObjectName(),"Value");
                try {
                    if (attributeValue != null && Integer.parseInt(attributeValue.toString()) == 1) {
                        topicUrpMap.put(topicName, topicUrpMap.get(topicName) + 1);
                    }
                } catch (ArithmeticException e) {
                    log.error(e);
                }
            }
        }

        for (Map.Entry<String, Integer> entry : topicUrpMap.entrySet()) {
            kafkaCluster.getTopicDetails(entry.getKey()).setUnderReplicatedPartitions(entry.getValue());
        }
    }

    @SneakyThrows
    private void loadJmxClusterMetrics(KafkaCluster kafkaCluster) {
        for (Map.Entry<MBeanInfo, String> mbeanToMetric : JmxConstants.mbeanToAttributeMap.entrySet()) {
            MBeanInfo mBeanInfo = mbeanToMetric.getKey();
            Object attributeValue = kafkaCluster.getMBeanServerConnection().getAttribute(new ObjectName(mBeanInfo.getName()), mBeanInfo.getAttribute());
            kafkaCluster.putMetric(mbeanToMetric.getValue(), attributeValue.toString());
        }
    }

    private boolean createJmxConnection(KafkaCluster kafkaCluster) {
        try {
            String url = "service:jmx:rmi:///jndi/rmi://" + kafkaCluster.getJmxHost() + ":" + kafkaCluster.getJmxPort() + "/jmxrmi";
            JMXServiceURL serviceUrl = new JMXServiceURL(url);
            JMXConnector jmxConnector = JMXConnectorFactory.connect(serviceUrl, null);
            kafkaCluster.setMBeanServerConnection(jmxConnector.getMBeanServerConnection());

            return true;
        } catch (Exception e) {
            log.error(e);
            kafkaCluster.setLastJmxException(e);

            return false;
        }
    }

    private boolean isJmxConnected(KafkaCluster kafkaCluster) {
        try {
            kafkaCluster.getMBeanServerConnection().getMBeanCount();

            return true;
        } catch (IOException e) {
            log.error(e);
            kafkaCluster.setLastJmxException(e);

            return false;
        }
    }
}
