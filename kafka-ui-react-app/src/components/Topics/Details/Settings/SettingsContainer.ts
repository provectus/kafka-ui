import { connect } from 'react-redux';
import { RootState, ClusterName, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  fetchTopicConfig,
} from 'redux/actions';
import Settings from './Settings';
import {
  getTopicConfig,
  getTopicConfigFetched,
} from 'redux/reducers/topics/selectors';


interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterName } } }: OwnProps) => ({
  clusterName,
  topicName,
  config: getTopicConfig(state, topicName),
  isFetched: getTopicConfigFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => fetchTopicConfig(clusterName, topicName),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Settings)
);
