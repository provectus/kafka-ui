import React from 'react';

interface ContextProps {
  isReadOnly: boolean;
  hasKafkaConnectConfigured: boolean;
  hasSchemaRegistryConfigured: boolean;
}

const initialValue: ContextProps = {
  isReadOnly: false,
  hasKafkaConnectConfigured: false,
  hasSchemaRegistryConfigured: false,
};
const ClusterContext = React.createContext(initialValue);

export default ClusterContext;
