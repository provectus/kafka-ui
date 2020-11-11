import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  getIsConsumerGroupDetailsFetched,
  getConsumerGroupByID,
} from 'redux/reducers/consumerGroups/selectors';
import { ConsumerGroupID } from 'redux/interfaces/consumerGroup';
import { fetchConsumerGroupDetails } from 'redux/actions/thunks';
import Details from './Details';

interface RouteProps {
  clusterName: ClusterName;
  consumerGroupID: string;
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
  ...getConsumerGroupByID(state, consumerGroupID),
});

const mapDispatchToProps = {
  fetchConsumerGroupDetails: (
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID
  ) => fetchConsumerGroupDetails(clusterName, consumerGroupID),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Details)
);
