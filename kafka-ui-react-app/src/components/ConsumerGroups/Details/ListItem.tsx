import React from 'react';
import { Consumer } from 'redux/interfaces/consumerGroup';
import { NavLink } from 'react-router-dom';
import { ClusterName } from 'redux/interfaces/cluster';


interface Props extends Consumer {
  clusterName: ClusterName;
}

const ListItem: React.FC<Props> = ({
  clusterName,
  consumerId,
  topic,
  partition,
  messagesBehind,
  currentOffset,
  endOffset
}) => {
  return (
    <tr>
      <td>
        {consumerId}
      </td>
      <td>
        <NavLink exact to={`/clusters/${clusterName}/topics/${topic}`} activeClassName="is-active" className="title is-6">
          {topic}
        </NavLink>
      </td>
      <td>{partition}</td>
      <td>{messagesBehind}</td>
      <td>{currentOffset}</td>
      <td>{endOffset}</td>
    </tr>
  );
}

export default ListItem;
