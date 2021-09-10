import React from 'react';
import { ClusterName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
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
  fetchConsumerGroupDetails,
  deleteConsumerGroup,
}) => {
  React.useEffect(() => {
    fetchConsumerGroupDetails(clusterName, groupId);
  }, [fetchConsumerGroupDetails, clusterName, groupId]);
  const items = partitions || [];
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

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb
            links={[
              {
                href: clusterConsumerGroupsPath(clusterName),
                label: 'All Consumer Groups',
              },
            ]}
          >
            {groupId}
          </Breadcrumb>
        </div>
      </div>

      {isFetched ? (
        <div className="box">
          {!isReadOnly && (
            <div className="level">
              <div className="level-item level-right buttons">
                <button
                  type="button"
                  className="button"
                  onClick={onResetOffsets}
                >
                  Reset offsets
                </button>
                <button
                  type="button"
                  className="button is-danger"
                  onClick={() => setIsConfirmationModelVisible(true)}
                >
                  Delete consumer group
                </button>
              </div>
            </div>
          )}

          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Consumer ID</th>
                <th>Host</th>
                <th>Topic</th>
                <th>Partition</th>
                <th>Messages behind</th>
                <th>Current offset</th>
                <th>End offset</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={10}>No active consumer groups</td>
                </tr>
              )}
              {items.map((consumer) => (
                <ListItem
                  key={consumer.consumerId}
                  clusterName={clusterName}
                  consumer={consumer}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PageLoader />
      )}
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
