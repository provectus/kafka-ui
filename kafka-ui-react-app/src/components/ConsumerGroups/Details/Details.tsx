import React from 'react';
import { ClusterName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterConsumerGroupsPath } from 'lib/paths';
import { ConsumerGroupID } from 'redux/interfaces/consumerGroup';
import {
  ConsumerGroup,
  ConsumerGroupDetails,
  ConsumerTopicPartitionDetail,
} from 'generated-sources';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useHistory } from 'react-router';

import ListItem from './ListItem';

export interface Props extends ConsumerGroup, ConsumerGroupDetails {
  clusterName: ClusterName;
  consumerGroupId: ConsumerGroupID;
  consumers?: ConsumerTopicPartitionDetail[];
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
  consumerGroupId,
  consumers,
  isFetched,
  isDeleted,
  fetchConsumerGroupDetails,
  deleteConsumerGroup,
}) => {
  React.useEffect(() => {
    fetchConsumerGroupDetails(clusterName, consumerGroupId);
  }, [fetchConsumerGroupDetails, clusterName, consumerGroupId]);
  const items = consumers || [];
  const [isConfirmationModelVisible, setIsConfirmationModelVisible] =
    React.useState<boolean>(false);
  const history = useHistory();

  const onDelete = () => {
    setIsConfirmationModelVisible(false);
    deleteConsumerGroup(clusterName, consumerGroupId);
  };
  React.useEffect(() => {
    if (isDeleted) {
      history.push(clusterConsumerGroupsPath(clusterName));
    }
  }, [isDeleted]);

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
            {consumerGroupId}
          </Breadcrumb>
        </div>
      </div>

      {isFetched ? (
        <div className="box">
          <div className="level">
            <div className="level-item level-right buttons">
              <button
                type="button"
                className="button is-danger"
                onClick={() => setIsConfirmationModelVisible(true)}
              >
                Delete consumer group
              </button>
            </div>
          </div>
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
