import React from 'react';
import { ConsumerGroupTopicPartition } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces/cluster';

interface Props {
  clusterName: ClusterName;
  consumer: ConsumerGroupTopicPartition;
}

const ListItem: React.FC<Props> = ({ clusterName, consumer }) => {
  return (
    <tr>
      <td>{consumer.consumerId}</td>
      <td>{consumer.host}</td>
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
