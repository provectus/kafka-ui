import React from 'react';
import { Cluster, ClusterStatus } from 'redux/interfaces';
import formatBytes from 'lib/utils/formatBytes';
import { NavLink } from 'react-router-dom';
import { clusterBrokersPath } from 'lib/paths';

const ClusterWidget: React.FC<Cluster> = ({
  name,
  status,
  topicCount,
  brokerCount,
  bytesInPerSec,
  bytesOutPerSec,
  onlinePartitionCount,
}) => (
  <NavLink to={clusterBrokersPath(name)} className="column is-full-modile is-6">
    <div className="box is-hoverable">
      <div
        className="title is-6 has-text-overflow-ellipsis"
        title={name}
      >
        <div
          className={`tag has-margin-right ${status === ClusterStatus.Online ? 'is-primary' : 'is-danger'}`}
        >
          {status}
        </div>
        {name}
      </div>

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <th>Brokers</th>
            <td>{brokerCount}</td>
          </tr>
          <tr>
            <th>Partitions</th>
            <td>{onlinePartitionCount}</td>
          </tr>
          <tr>
            <th>Topics</th>
            <td>{topicCount}</td>
          </tr>
          <tr>
            <th>Production</th>
            <td>{formatBytes(bytesInPerSec)}</td>
          </tr>
          <tr>
            <th>Consumption</th>
            <td>{formatBytes(bytesOutPerSec)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </NavLink>
);

export default ClusterWidget;
