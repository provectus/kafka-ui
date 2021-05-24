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
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import ClusterContext from 'components/contexts/ClusterContext';

export interface ListItemProps {
  topic: TopicWithDetailedInfo;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  clusterName: ClusterName;
  clearTopicMessages(topicName: TopicName, clusterName: ClusterName): void;
}

const ListItem: React.FC<ListItemProps> = ({
  topic: { name, internal, partitions },
  deleteTopic,
  clusterName,
  clearTopicMessages,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);

  const [isDeleteTopicConfirmationVisible, setDeleteTopicConfirmationVisible] =
    React.useState(false);

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

  const clearTopicMessagesHandler = React.useCallback(() => {
    clearTopicMessages(clusterName, name);
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
      <td className="topic-action-block">
        {!internal && !isReadOnly ? (
          <>
            <div className="has-text-right">
              <Dropdown
                label={
                  <span className="icon">
                    <i className="fas fa-cog" />
                  </span>
                }
                right
              >
                <DropdownItem onClick={clearTopicMessagesHandler}>
                  <span className="has-text-danger">Clear Messages</span>
                </DropdownItem>
                <DropdownItem
                  onClick={() => setDeleteTopicConfirmationVisible(true)}
                >
                  <span className="has-text-danger">Remove Topic</span>
                </DropdownItem>
              </Dropdown>
            </div>
            <ConfirmationModal
              isOpen={isDeleteTopicConfirmationVisible}
              onCancel={() => setDeleteTopicConfirmationVisible(false)}
              onConfirm={deleteTopicHandler}
            >
              Are you sure want to remove <b>{name}</b> topic?
            </ConfirmationModal>
          </>
        ) : null}
      </td>
    </tr>
  );
};

export default ListItem;
