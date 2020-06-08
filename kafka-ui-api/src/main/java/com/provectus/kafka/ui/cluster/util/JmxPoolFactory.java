package com.provectus.kafka.ui.cluster.util;

import org.apache.commons.pool2.BaseKeyedPooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;

import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;

public class JmxPoolFactory extends BaseKeyedPooledObjectFactory<String, JMXConnector> {

    @Override
    public JMXConnector create(String s) throws Exception {
        return JMXConnectorFactory.connect(new JMXServiceURL(s));
    }

    @Override
    public PooledObject<JMXConnector> wrap(JMXConnector jmxConnector) {
        return new DefaultPooledObject<>(jmxConnector);
    }
}
