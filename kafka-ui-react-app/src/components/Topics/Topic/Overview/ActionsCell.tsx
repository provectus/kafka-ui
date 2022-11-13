import React from 'react';
import {
  Action,
  Partition,
  UserPermissionResourceEnum,
} from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { useAppDispatch } from 'lib/hooks/redux';
import ClusterContext from 'components/contexts/ClusterContext';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { Dropdown } from 'components/common/Dropdown';
import { useTopicDetails } from 'lib/hooks/api/topics';
import ActionDropdownItem from 'components/common/Dropdown/ActionDropdownItem';
import { usePermission } from 'lib/hooks/usePermission';

const ActionsCell: React.FC<CellContext<Partition, unknown>> = ({ row }) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const { data } = useTopicDetails({ clusterName, topicName });
  const { isReadOnly } = React.useContext(ClusterContext);
  const { partition } = row.original;
  const dispatch = useAppDispatch();
  const canClearMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.MESSAGES_DELETE,
    topicName
  );

  const clearTopicMessagesHandler = async () => {
    await dispatch(
      clearTopicMessages({ clusterName, topicName, partitions: [partition] })
    ).unwrap();
  };
  const disabled =
    data?.internal || isReadOnly || data?.cleanUpPolicy !== 'DELETE';
  return (
    <Dropdown disabled={disabled}>
      <ActionDropdownItem
        onClick={clearTopicMessagesHandler}
        danger
        canDoAction={canClearMessage}
      >
        Clear Messages
      </ActionDropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
