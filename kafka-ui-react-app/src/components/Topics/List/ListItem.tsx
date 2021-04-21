import React from 'react';
import cx from 'classnames';
import { NavLink } from 'react-router-dom';
import {
  ClusterName,
  TopicName,
  TopicWithDetailedInfo,
} from 'redux/interfaces';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import Dropdown from 'components/common/Dropdown/Dropdown';

export interface ListItemProps {
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
      <td className="has-text-overflow-ellipsis">
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
        <div className={cx('tag', internal ? 'is-light' : 'is-primary')}>
          {internal ? 'Internal' : 'External'}
        </div>
      </td>
      <td className="has-text-right">
        <Dropdown
          label={
            <span className="icon">
              <i className="fas fa-cog" />
            </span>
          }
          right
        >
          <DropdownItem onClick={deleteTopicHandler}>
            <span className="has-text-danger">Remove Topic</span>
          </DropdownItem>
        </Dropdown>
      </td>
    </tr>
  );
};

export default ListItem;
