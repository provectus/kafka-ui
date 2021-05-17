import { Connect, Connector, FullConnectorInfo, Task } from 'generated-sources';

export type ConnectName = Connect['name'];
export type ConnectorName = Connector['name'];
export type ConnectorConfig = Connector['config'];

export interface ConnectState {
  connects: Connect[];
  connectors: FullConnectorInfo[];
  currentConnector: {
    connector: Connector | null;
    tasks: Task[];
    config: ConnectorConfig | null;
  };
}
