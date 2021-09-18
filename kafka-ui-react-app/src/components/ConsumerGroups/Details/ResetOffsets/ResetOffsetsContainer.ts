import { RouteComponentProps, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ClusterName, ConsumerGroupID, RootState } from 'redux/interfaces';
import {
  getConsumerGroupByID,
  getIsConsumerGroupDetailsFetched,
  getOffsetReset,
} from 'redux/reducers/consumerGroups/selectors';
import {
  fetchConsumerGroupDetails,
  resetConsumerGroupOffsets,
  resetConsumerGroupOffsetsAction,
} from 'redux/actions';

import ResetOffsets from './ResetOffsets';

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
  consumerGroup: getConsumerGroupByID(state, consumerGroupID),
  detailsAreFetched: getIsConsumerGroupDetailsFetched(state),
  IsOffsetReset: getOffsetReset(state),
});

const mapDispatchToProps = {
  fetchConsumerGroupDetails,
  resetConsumerGroupOffsets,
  resetResettingStatus: resetConsumerGroupOffsetsAction.cancel,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ResetOffsets)
);
