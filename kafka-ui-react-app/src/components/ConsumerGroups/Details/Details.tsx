import React from 'react';
import { ClusterName } from 'redux/interfaces';
import {
  clusterConsumerGroupResetOffsetsPath,
  clusterConsumerGroupsPath,
} from 'lib/paths';
import { ConsumerGroupID } from 'redux/interfaces/consumerGroup';
import {
  ConsumerGroup,
  ConsumerGroupDetails,
  ConsumerGroupTopicPartition,
} from 'generated-sources';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useHistory } from 'react-router';
import ClusterContext from 'components/contexts/ClusterContext';
import PageHeading from 'components/common/PageHeading/PageHeading';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import { MetricsContainerStyled } from 'components/common/Dashboard/MetricsContainer.styled';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import TagStyled from 'components/common/Tag/Tag.styled';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import { Colors } from 'theme/theme';
import { groupBy } from 'lodash';
import StyledTable from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';

import ListItem from './ListItem';

export interface Props extends ConsumerGroup, ConsumerGroupDetails {
  clusterName: ClusterName;
  partitions?: ConsumerGroupTopicPartition[];
  isFetched: boolean;
  isDeleted: boolean;
  fetchConsumerGroupDetails: (
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID
  ) => void;
  deleteConsumerGroup: (clusterName: string, id: ConsumerGroupID) => void;
}

const Details: React.FC<Props> = ({
  clusterName,
  groupId,
  partitions,
  isFetched,
  isDeleted,
  state,
  members,
  topics,
  coordinator,
  fetchConsumerGroupDetails,
  deleteConsumerGroup,
}) => {
  React.useEffect(() => {
    fetchConsumerGroupDetails(clusterName, groupId);
  }, [fetchConsumerGroupDetails, clusterName, groupId]);
  const [isConfirmationModelVisible, setIsConfirmationModelVisible] =
    React.useState<boolean>(false);
  const history = useHistory();
  const { isReadOnly } = React.useContext(ClusterContext);

  const onDelete = () => {
    setIsConfirmationModelVisible(false);
    deleteConsumerGroup(clusterName, groupId);
  };
  React.useEffect(() => {
    if (isDeleted) {
      history.push(clusterConsumerGroupsPath(clusterName));
    }
  }, [isDeleted]);

  const onResetOffsets = () => {
    history.push(clusterConsumerGroupResetOffsetsPath(clusterName, groupId));
  };

  const partitionsByTopic = groupBy(partitions, 'topic');

  if (!isFetched) {
    return <PageLoader />;
  }

  return (
    <div>
      <div>
        <PageHeading text={groupId}>
          {!isReadOnly && (
            <Dropdown label={<VerticalElipsisIcon />} right>
              <DropdownItem onClick={onResetOffsets}>
                Reset offsest
              </DropdownItem>
              <DropdownItem
                style={{ color: Colors.red[50] }}
                onClick={() => setIsConfirmationModelVisible(true)}
              >
                Delete consumer group
              </DropdownItem>
            </Dropdown>
          )}
        </PageHeading>
      </div>
      <MetricsContainerStyled>
        <MetricsWrapper>
          <Indicator label="State">
            <TagStyled color="yellow">{state || 'unknown'}</TagStyled>
          </Indicator>
          <Indicator label="Members">{members}</Indicator>
          <Indicator label="Assigned topics">{topics}</Indicator>
          <Indicator label="Assigned partitions">
            {partitions?.length}
          </Indicator>
          <Indicator label="Coordinator ID">{coordinator?.id}</Indicator>
        </MetricsWrapper>
      </MetricsContainerStyled>
      <StyledTable isFullwidth>
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
      </StyledTable>
      <ConfirmationModal
        isOpen={isConfirmationModelVisible}
        onCancel={() => setIsConfirmationModelVisible(false)}
        onConfirm={onDelete}
      >
        Are you sure you want to delete this consumer group?
      </ConfirmationModal>
    </div>
  );
};

export default Details;
