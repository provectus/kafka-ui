import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import {
  clusterConsumerGroupResetRelativePath,
  clusterConsumerGroupsPath,
  ClusterGroupParam,
} from 'lib/paths';
import Search from 'components/common/Search/Search';
import ClusterContext from 'components/contexts/ClusterContext';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';
import groupBy from 'lodash/groupBy';
import { Table } from 'components/common/table/Table/Table.styled';
import getTagColor from 'components/common/Tag/getTagColor';
import { Dropdown } from 'components/common/Dropdown';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import { Action, ResourceType } from 'generated-sources';
import { ActionDropdownItem } from 'components/common/ActionComponent';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import {
  useConsumerGroupDetails,
  useDeleteConsumerGroupMutation,
} from 'lib/hooks/api/consumers';

import ListItem from './ListItem';

const Details: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchValue = searchParams.get('q') || '';
  const { isReadOnly } = React.useContext(ClusterContext);
  const routeParams = useAppParams<ClusterGroupParam>();
  const { clusterName, consumerGroupID } = routeParams;

  const consumerGroup = useConsumerGroupDetails(routeParams);
  const deleteConsumerGroup = useDeleteConsumerGroupMutation(routeParams);

  const onDelete = async () => {
    await deleteConsumerGroup.mutateAsync();
    navigate('../');
  };

  const onResetOffsets = () => {
    navigate(clusterConsumerGroupResetRelativePath);
  };

  const partitionsByTopic = groupBy(consumerGroup.data?.partitions, 'topic');
  const filteredPartitionsByTopic = Object.keys(partitionsByTopic).filter(
    (el) => el.includes(searchValue)
  );
  const currentPartitionsByTopic = searchValue.length
    ? filteredPartitionsByTopic
    : Object.keys(partitionsByTopic);

  return (
    <div>
      <div>
        <PageHeading
          text={consumerGroupID}
          backTo={clusterConsumerGroupsPath(clusterName)}
          backText="Consumers"
        >
          {!isReadOnly && (
            <Dropdown>
              <ActionDropdownItem
                onClick={onResetOffsets}
                permission={{
                  resource: ResourceType.CONSUMER,
                  action: Action.RESET_OFFSETS,
                  value: consumerGroupID,
                }}
              >
                Reset offset
              </ActionDropdownItem>
              <ActionDropdownItem
                confirm="Are you sure you want to delete this consumer group?"
                onClick={onDelete}
                danger
                permission={{
                  resource: ResourceType.CONSUMER,
                  action: Action.DELETE,
                  value: consumerGroupID,
                }}
              >
                Delete consumer group
              </ActionDropdownItem>
            </Dropdown>
          )}
        </PageHeading>
      </div>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="State">
            <Tag color={getTagColor(consumerGroup.data?.state)}>
              {consumerGroup.data?.state}
            </Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Members">
            {consumerGroup.data?.members}
          </Metrics.Indicator>
          <Metrics.Indicator label="Assigned Topics">
            {consumerGroup.data?.topics}
          </Metrics.Indicator>
          <Metrics.Indicator label="Assigned Partitions">
            {consumerGroup.data?.partitions?.length}
          </Metrics.Indicator>
          <Metrics.Indicator label="Coordinator ID">
            {consumerGroup.data?.coordinator?.id}
          </Metrics.Indicator>
          <Metrics.Indicator label="Total lag">
            {consumerGroup.data?.messagesBehind}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <ControlPanelWrapper hasInput style={{ margin: '16px 0 20px' }}>
        <Search placeholder="Search by Topic Name" />
      </ControlPanelWrapper>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Topic" />
            <TableHeaderCell title="Messages behind" />
          </tr>
        </thead>
        <tbody>
          {currentPartitionsByTopic.map((key) => (
            <ListItem
              clusterName={clusterName}
              consumers={partitionsByTopic[key]}
              name={key}
              key={key}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Details;
