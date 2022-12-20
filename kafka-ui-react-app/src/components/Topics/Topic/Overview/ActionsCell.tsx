import React from 'react';
import { Partition } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import ClusterContext from 'components/contexts/ClusterContext';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { useClearTopicMessages, useTopicDetails } from 'lib/hooks/api/topics';

const ActionsCell: React.FC<CellContext<Partition, unknown>> = ({ row }) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const { data } = useTopicDetails({ clusterName, topicName });
  const { isReadOnly } = React.useContext(ClusterContext);
  const { partition } = row.original;

  const clearMessage = useClearTopicMessages(clusterName, [partition]);

  const clearTopicMessagesHandler = async () => {
    await clearMessage.mutateAsync(topicName);
  };
  const disabled =
    data?.internal || isReadOnly || data?.cleanUpPolicy !== 'DELETE';
  return (
    <Dropdown disabled={disabled}>
      <DropdownItem onClick={clearTopicMessagesHandler} danger>
        Clear Messages
      </DropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
