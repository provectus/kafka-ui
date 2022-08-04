import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import {
  clusterConsumerGroupResetRelativePath,
  ClusterGroupParam,
} from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ClusterContext from 'components/contexts/ClusterContext';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';
import groupBy from 'lodash/groupBy';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchConsumerGroupDetails,
  deleteConsumerGroup,
  selectById,
  getIsConsumerGroupDeleted,
  getAreConsumerGroupDetailsFulfilled,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import getTagColor from 'components/common/Tag/getTagColor';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';

import ListItem from './ListItem';

const Details: React.FC = () => {
  const navigate = useNavigate();
  const { isReadOnly } = React.useContext(ClusterContext);
  const { consumerGroupID, clusterName } = useAppParams<ClusterGroupParam>();
  const dispatch = useAppDispatch();
  const consumerGroup = useAppSelector((state) =>
    selectById(state, consumerGroupID)
  );
  const isDeleted = useAppSelector(getIsConsumerGroupDeleted);
  const isFetched = useAppSelector(getAreConsumerGroupDetailsFulfilled);

  React.useEffect(() => {
    dispatch(fetchConsumerGroupDetails({ clusterName, consumerGroupID }));
  }, [clusterName, consumerGroupID, dispatch]);

  const onDelete = () => {
    dispatch(deleteConsumerGroup({ clusterName, consumerGroupID }));
  };

  React.useEffect(() => {
    if (isDeleted) {
      navigate('../');
    }
  }, [clusterName, navigate, isDeleted]);

  const onResetOffsets = () => {
    navigate(clusterConsumerGroupResetRelativePath);
  };

  if (!isFetched || !consumerGroup) {
    return <PageLoader />;
  }

  const partitionsByTopic = groupBy(consumerGroup.partitions, 'topic');

  return (
    <div>
      <div>
        <PageHeading text={consumerGroupID}>
          {!isReadOnly && (
            <Dropdown>
              <DropdownItem onClick={onResetOffsets}>Reset offset</DropdownItem>
              <DropdownItem
                confirm="Are you sure you want to delete this consumer group?"
                onClick={onDelete}
                danger
              >
                Delete consumer group
              </DropdownItem>
            </Dropdown>
          )}
        </PageHeading>
      </div>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="State">
            <Tag color={getTagColor(consumerGroup)}>{consumerGroup.state}</Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Members">
            {consumerGroup.members}
          </Metrics.Indicator>
          <Metrics.Indicator label="Assigned Topics">
            {consumerGroup.topics}
          </Metrics.Indicator>
          <Metrics.Indicator label="Assigned Partitions">
            {consumerGroup.partitions?.length}
          </Metrics.Indicator>
          <Metrics.Indicator label="Coordinator ID">
            {consumerGroup.coordinator?.id}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell> </TableHeaderCell>
            <TableHeaderCell title="Topic" />
          </tr>
        </thead>
        <tbody>
          {Object.keys(partitionsByTopic).map((key) => (
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
