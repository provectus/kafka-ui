import { connect } from 'react-redux';
import { RootState, ClusterName, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { fetchTopicConfig } from 'redux/reducers/topics/topicsSlice';
import {
  getTopicConfig,
  getTopicConfigFetched,
} from 'redux/reducers/topics/selectors';

import Settings from './Settings';

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
  config: getTopicConfig(state, topicName),
  isFetched: getTopicConfigFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConfig,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Settings)
);
