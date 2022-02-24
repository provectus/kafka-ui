import React from 'react';
import { ClusterName } from 'redux/interfaces';
import {
  clusterConsumerGroupResetOffsetsPath,
  clusterConsumerGroupsPath,
} from 'lib/paths';
import { ConsumerGroupID } from 'redux/interfaces/consumerGroup';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useHistory, useParams } from 'react-router';
import ClusterContext from 'components/contexts/ClusterContext';
import PageHeading from 'components/common/PageHeading/PageHeading';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import { groupBy } from 'lodash';
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
import getTagColor from 'components/ConsumerGroups/Utils/TagColor';

import ListItem from './ListItem';

const Details: React.FC = () => {
  const history = useHistory();
  const { isReadOnly } = React.useContext(ClusterContext);
  const { consumerGroupID, clusterName } =
    useParams<{ consumerGroupID: ConsumerGroupID; clusterName: ClusterName }>();
  const dispatch = useAppDispatch();
  const consumerGroup = useAppSelector((state) =>
    selectById(state, consumerGroupID)
  );
  const isDeleted = useAppSelector(getIsConsumerGroupDeleted);
  const isFetched = useAppSelector(getAreConsumerGroupDetailsFulfilled);

  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    dispatch(fetchConsumerGroupDetails({ clusterName, consumerGroupID }));
  }, [clusterName, consumerGroupID, dispatch]);

  const onDelete = () => {
    setIsConfirmationModalVisible(false);
    dispatch(deleteConsumerGroup({ clusterName, consumerGroupID }));
  };
  React.useEffect(() => {
    if (isDeleted) {
      history.push(clusterConsumerGroupsPath(clusterName));
    }
  }, [clusterName, history, isDeleted]);

  const onResetOffsets = () => {
    history.push(
      clusterConsumerGroupResetOffsetsPath(clusterName, consumerGroupID)
    );
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
            <Dropdown label={<VerticalElipsisIcon />} right>
              <DropdownItem onClick={onResetOffsets}>Reset offset</DropdownItem>
              <DropdownItem
                onClick={() => setIsConfirmationModalVisible(true)}
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
      <ConfirmationModal
        isOpen={isConfirmationModalVisible}
        onCancel={() => setIsConfirmationModalVisible(false)}
        onConfirm={onDelete}
      >
        Are you sure you want to delete this consumer group?
      </ConfirmationModal>
    </div>
  );
};

export default Details;
