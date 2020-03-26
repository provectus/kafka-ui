import React from 'react';
import { ClusterName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterConsumerGroupsPath } from 'lib/paths';
import { ConsumerGroupID, ConsumerGroup, ConsumerGroupDetails } from 'redux/interfaces/consumerGroup';
import { Consumer } from '../../../redux/interfaces/consumerGroup';
import ListItem from './ListItem';

interface Props extends ConsumerGroup, ConsumerGroupDetails {
  clusterName: ClusterName;
  consumerGroupID: ConsumerGroupID;
  consumers: (Consumer)[];
  fetchConsumerGroupDetails: (clusterName: ClusterName, consumerGroupID: ConsumerGroupID) => void;
}

const Details: React.FC<Props> = ({
  clusterName,
  consumerGroupID,
  consumers,
  fetchConsumerGroupDetails
}) => {

  React.useEffect(
    () => { fetchConsumerGroupDetails(clusterName, consumerGroupID); },
    [fetchConsumerGroupDetails, clusterName, consumerGroupID],
  );
  const items = consumers || [];

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb links={[
            { href: clusterConsumerGroupsPath(clusterName), label: 'All Consumer Groups' },
          ]}>
            {consumerGroupID}
          </Breadcrumb>
        </div>
      </div>

      <div className="box">
      <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Consumer ID</th>
              <th>Topic</th>
              <th>Partition</th>
              <th>Messages behind</th>
              <th>Current offset</th>
              <th>End offset</th>
            </tr>
          </thead>
          <tbody>
            {items
              .map((consumer, index) => (
                <ListItem
                  key={`consumers-list-item-key-${index}`}
                  {...{clusterName, ...consumer}}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;
