import { connect } from 'react-redux';
import {
  RootState,
  ClusterName,
  TopicName,
  Action,
} from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  updateTopic,
  fetchTopicConfig,
  fetchTopicDetails,
} from 'redux/actions';
import {
  getTopicConfigFetched,
  getTopicUpdated,
  getIsTopicDetailsFetched,
  getFullTopic,
} from 'redux/reducers/topics/selectors';
import { clusterTopicPath } from 'lib/paths';
import { ThunkDispatch } from 'redux-thunk';
import Edit from './Edit';
import { TopicFormDataRaw } from 'redux/interfaces';

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
  isTopicDetailsFetched: getIsTopicDetailsFetched(state),
  isTopicUpdated: getTopicUpdated(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, Action>,
  { history }: OwnProps
) => ({
  fetchTopicDetails: (clusterName: ClusterName, topicName: TopicName) =>
    dispatch(fetchTopicDetails(clusterName, topicName)),
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) =>
    dispatch(fetchTopicConfig(clusterName, topicName)),
  updateTopic: (clusterName: ClusterName, form: TopicFormDataRaw) =>
    dispatch(updateTopic(clusterName, form)),
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => {
    history.push(clusterTopicPath(clusterName, topicName));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Edit));
