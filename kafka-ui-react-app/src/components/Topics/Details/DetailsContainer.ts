import { connect } from 'react-redux';
import Details from './Details';
import {
  ClusterName,
  RootState,
  TopicName
} from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterName } } }: OwnProps) => ({
  clusterName,
  topicName,
});

export default withRouter(
  connect(mapStateToProps)(Details)
);
