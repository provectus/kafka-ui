import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  getIsConsumerGroupDetailsFetched,
  getIsConsumerGroupsDeleted,
  getConsumerGroupByID,
} from 'redux/reducers/consumerGroups/selectors';
import { ConsumerGroupID } from 'redux/interfaces/consumerGroup';
import {
  deleteConsumerGroup,
  fetchConsumerGroupDetails,
} from 'redux/actions/thunks';

import Details from './Details';

interface RouteProps {
  clusterName: ClusterName;
  consumerGroupID: ConsumerGroupID;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { consumerGroupID, clusterName },
    },
  }: OwnProps
) => ({
  clusterName,
  consumerGroupID,
  isFetched: getIsConsumerGroupDetailsFetched(state),
  isDeleted: getIsConsumerGroupsDeleted(state),
  ...getConsumerGroupByID(state, consumerGroupID),
});

const mapDispatchToProps = {
  fetchConsumerGroupDetails: (
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID
  ) => fetchConsumerGroupDetails(clusterName, consumerGroupID),
  deleteConsumerGroup: (clusterName: string, id: ConsumerGroupID) =>
    deleteConsumerGroup(clusterName, id),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Details)
);
