import React from 'react';
import cx from 'classnames';
import { NavLink } from 'react-router-dom';
import {
  ClusterName,
  TopicName,
  TopicWithDetailedInfo,
} from 'redux/interfaces';

interface ListItemProps {
  topic: TopicWithDetailedInfo;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  clusterName: ClusterName;
}

const ListItem: React.FC<ListItemProps> = ({
  topic: { name, internal, partitions },
  deleteTopic,
  clusterName,
}) => {
  const outOfSyncReplicas = React.useMemo(() => {
    if (partitions === undefined || partitions.length === 0) {
      return 0;
    }

    return partitions.reduce((memo: number, { replicas }) => {
      const outOfSync = replicas?.filter(({ inSync }) => !inSync);
      return memo + (outOfSync?.length || 0);
    }, 0);
  }, [partitions]);

  const deleteTopicHandler = React.useCallback(() => {
    deleteTopic(clusterName, name);
  }, [clusterName, name]);

  return (
    <tr>
      <td>
        <NavLink
          exact
          to={`topics/${name}`}
          activeClassName="is-active"
          className="title is-6"
        >
          {name}
        </NavLink>
      </td>
      <td>{partitions?.length}</td>
      <td>{outOfSyncReplicas}</td>
      <td>
        <div
          className={cx('tag is-small', internal ? 'is-light' : 'is-success')}
        >
          {internal ? 'Internal' : 'External'}
        </div>
      </td>
      <td>
        <button
          type="button"
          className="is-small button is-danger"
          onClick={deleteTopicHandler}
        >
          <span className="icon is-small">
            <i className="far fa-trash-alt" />
          </span>
        </button>
      </td>
    </tr>
  );
};

export default ListItem;
