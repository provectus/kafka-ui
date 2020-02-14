package com.provectus.kafka.ui.jmx;

import com.provectus.kafka.ui.cluster.model.KafkaCluster;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.util.Map;

@Service
@Log4j2
@RequiredArgsConstructor
public class JmxService {

    @SneakyThrows
    public void loadClusterMetrics(KafkaCluster kafkaCluster) {
        String url = "service:jmx:rmi:///jndi/rmi://" + kafkaCluster.getJmxHost() + ":" + kafkaCluster.getJmxPort() + "/jmxrmi";
        JMXServiceURL serviceUrl = new JMXServiceURL(url);
        try (JMXConnector jmxConnector = JMXConnectorFactory.connect(serviceUrl, null)) {
            MBeanServerConnection connection = jmxConnector.getMBeanServerConnection();
            for (Map.Entry<MBeanInfo, String> mbeanToMetric : JmxConstants.mbeanToAttributeMap.entrySet()) {
                MBeanInfo mBeanInfo = mbeanToMetric.getKey();
                Object attributeValue = connection.getAttribute(new ObjectName(mBeanInfo.getName()), mBeanInfo.getAttribute());
                kafkaCluster.putMetric(mbeanToMetric.getValue(), attributeValue.toString());
            }
        }
    }
}
