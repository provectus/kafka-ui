package com.provectus.kafka.ui.cluster.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.BaseKeyedPooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;

import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.io.IOException;

@Slf4j
public class JmxPoolFactory extends BaseKeyedPooledObjectFactory<String, JMXConnector> {

    @Override
    public JMXConnector create(String s) throws Exception {
        return JMXConnectorFactory.connect(new JMXServiceURL(s));
    }

    @Override
    public PooledObject<JMXConnector> wrap(JMXConnector jmxConnector) {
        return new DefaultPooledObject<>(jmxConnector);
    }

    @Override
    public void destroyObject(String key, PooledObject<JMXConnector> p) {
        try {
            p.getObject().close();
        } catch (IOException e) {
            log.error("Cannot close connection with {}", key);
        }
    }
}
