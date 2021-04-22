import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { getConsumerGroupsList } from 'redux/reducers/consumerGroups/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import List from './List';

interface RouteProps {
  clusterName: ClusterName;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { clusterName },
    },
  }: OwnProps
) => ({
  clusterName,
  consumerGroups: getConsumerGroupsList(state),
});

export default withRouter(connect(mapStateToProps)(List));
