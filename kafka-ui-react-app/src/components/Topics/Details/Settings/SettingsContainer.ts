import { connect } from 'react-redux';
import { RootState, ClusterId, TopicName } from 'redux/interfaces';
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
  clusterId: string;
  topicName: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterId } } }: OwnProps) => ({
  clusterId,
  topicName,
  config: getTopicConfig(state, topicName),
  isFetched: getTopicConfigFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConfig: (clusterId: ClusterId, topicName: TopicName) => fetchTopicConfig(clusterId, topicName),
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Settings)
);
