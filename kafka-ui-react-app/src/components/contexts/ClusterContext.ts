import React from 'react';

export interface ContextProps {
  isReadOnly: boolean;
  hasKafkaConnectConfigured: boolean;
  hasSchemaRegistryConfigured: boolean;
  isTopicDeletionAllowed: boolean;
}

export const initialValue: ContextProps = {
  isReadOnly: false,
  hasKafkaConnectConfigured: false,
  hasSchemaRegistryConfigured: false,
  isTopicDeletionAllowed: true,
};
const ClusterContext = React.createContext(initialValue);

export default ClusterContext;
