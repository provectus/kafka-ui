import React from 'react';
import { Consumer } from 'redux/interfaces/consumerGroup';
import { NavLink } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces/cluster';

interface Props {
  clusterName: ClusterName;
  consumer: Consumer;
}

const ListItem: React.FC<Props> = ({ clusterName, consumer }) => {
  return (
    <tr>
      <td>{consumer.consumerId}</td>
      <td>
        <NavLink
          exact
          to={`/clusters/${clusterName}/topics/${consumer.topic}`}
          activeClassName="is-active"
          className="title is-6"
        >
          {consumer.topic}
        </NavLink>
      </td>
      <td>{consumer.partition}</td>
      <td>{consumer.messagesBehind}</td>
      <td>{consumer.currentOffset}</td>
      <td>{consumer.endOffset}</td>
    </tr>
  );
};

export default ListItem;
