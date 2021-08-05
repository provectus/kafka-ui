import React from 'react';
import { Connector } from 'generated-sources';
import ConnectorStatusTag from 'components/Connect/ConnectorStatusTag';

export interface OverviewProps {
  connector: Connector | null;
  runningTasksCount: number;
  failedTasksCount: number;
}

const Overview: React.FC<OverviewProps> = ({
  connector,
  runningTasksCount,
  failedTasksCount,
}) => {
  if (!connector) return null;

  return (
    <div className="tile is-6">
      <table className="table is-fullwidth">
        <tbody>
          {connector.status?.workerId && (
            <tr>
              <th>Worker</th>
              <td>{connector.status.workerId}</td>
            </tr>
          )}
          <tr>
            <th>Type</th>
            <td>{connector.type}</td>
          </tr>
          {connector.config['connector.class'] && (
            <tr>
              <th>Class</th>
              <td>{connector.config['connector.class']}</td>
            </tr>
          )}
          <tr>
            <th>State</th>
            <td>
              <ConnectorStatusTag status={connector.status.state} />
            </td>
          </tr>
          <tr>
            <th>Tasks Running</th>
            <td>{runningTasksCount}</td>
          </tr>
          <tr>
            <th>Tasks Failed</th>
            <td>{failedTasksCount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Overview;
