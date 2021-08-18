import React from 'react';
import { NavLink } from 'react-router-dom';
import { clusterBrokersPath, clusterTopicsPath } from 'lib/paths';
import { Cluster, ServerStatus } from 'generated-sources';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

interface ClusterWidgetProps {
  cluster: Cluster;
}

const ClusterWidget: React.FC<ClusterWidgetProps> = ({
  cluster: {
    name,
    status,
    topicCount,
    brokerCount,
    bytesInPerSec,
    bytesOutPerSec,
    onlinePartitionCount,
    readOnly,
    version,
  },
}) => (
  <div className="column is-full-modile is-6">
    <div className="box">
      <div className="title is-6 has-text-overflow-ellipsis">
        <div
          className={`tag mr-2 ${
            status === ServerStatus.ONLINE ? 'is-success' : 'is-danger'
          }`}
        >
          {status}
        </div>
        {readOnly && <div className="tag mr-2 is-info is-light">readonly</div>}
        {name}
      </div>

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <th>Version</th>
            <td>{version}</td>
          </tr>
          <tr>
            <th>Brokers</th>
            <td>
              <NavLink to={clusterBrokersPath(name)}>{brokerCount}</NavLink>
            </td>
          </tr>
          <tr>
            <th>Partitions</th>
            <td>{onlinePartitionCount}</td>
          </tr>
          <tr>
            <th>Topics</th>
            <td>
              <NavLink to={clusterTopicsPath(name)}>{topicCount}</NavLink>
            </td>
          </tr>
          <tr>
            <th>Production</th>
            <td>
              <BytesFormatted value={bytesInPerSec} />
            </td>
          </tr>
          <tr>
            <th>Consumption</th>
            <td>
              <BytesFormatted value={bytesOutPerSec} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default ClusterWidget;
