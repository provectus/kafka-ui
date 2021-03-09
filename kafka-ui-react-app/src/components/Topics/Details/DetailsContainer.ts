import { connect } from 'react-redux';
import { ClusterName, RootState, TopicName } from 'redux/interfaces';
import { getClustersReadonlyStatus } from 'redux/reducers/clusters/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Details from './Details';

interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { topicName, clusterName },
    },
  }: OwnProps
) => ({
  clusterName,
  topicName,
  isReadOnly: getClustersReadonlyStatus(clusterName)(state),
});

export default withRouter(connect(mapStateToProps)(Details));
