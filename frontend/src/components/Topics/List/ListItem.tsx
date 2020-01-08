import React from 'react';
import { NavLink } from 'react-router-dom';
import { Topic, TopicDetails } from 'types';

const ListItem: React.FC<Topic & TopicDetails> = ({
  name,
  partitions,
}) => {
  const outOfSyncReplicas = React.useMemo(() => {
    if (partitions === undefined || partitions.length === 0) {
      return 0;
    }

    return partitions.reduce((memo: number, { replicas }) => {
      const outOfSync = replicas.filter(({ inSync }) => !inSync)
      return memo + outOfSync.length;
    }, 0);
  }, [partitions])

  return (
    <tr>
      <td>
        <NavLink exact to={`topics/${name}`} activeClassName="is-active" className="title is-6">
          {name}
        </NavLink>
      </td>
      <td>{partitions.length}</td>
      <td>{outOfSyncReplicas}</td>
    </tr>
  );
}

export default ListItem;
