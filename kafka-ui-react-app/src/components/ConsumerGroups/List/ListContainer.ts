import { connect } from 'react-redux';
import {ClusterName, RootState} from 'redux/interfaces';
import { getConsumerGroupsList } from 'redux/reducers/consumerGroups/selectors';
import List from './List';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterName: ClusterName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterName } } }: OwnProps) => ({
  clusterName,
  consumerGroups: getConsumerGroupsList(state)
});

export default withRouter(
  connect(mapStateToProps)(List)
);
