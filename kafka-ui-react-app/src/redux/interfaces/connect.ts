import { Connect, FullConnectorInfo } from 'generated-sources';

export interface ConnectState {
  connects: Connect[];
  connectors: FullConnectorInfo[];
}
