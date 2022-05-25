import { connect } from 'react-redux';
import { RootState, ClusterName, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  updateTopic,
  fetchTopicConfig,
} from 'redux/reducers/topics/topicsSlice';
import {
  getTopicConfigFetched,
  getTopicUpdated,
  getFullTopic,
} from 'redux/reducers/topics/selectors';

import Edit from './Edit';

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
  topic: getFullTopic(state, topicName),
  isFetched: getTopicConfigFetched(state),
  isTopicUpdated: getTopicUpdated(state),
});

const mapDispatchToProps = {
  fetchTopicConfig,
  updateTopic,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Edit));
