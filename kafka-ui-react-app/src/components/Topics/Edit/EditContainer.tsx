import { connect } from 'react-redux';
import {
  RootState,
  ClusterName,
  TopicFormData,
  TopicName,
  Action,
} from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { updateTopic, fetchTopicConfig } from 'redux/actions';
import {
  getTopicConfigFetched,
  getTopicConfigByParamName,
} from 'redux/reducers/topics/selectors';
import { clusterTopicPath } from 'lib/paths';
import { ThunkDispatch } from 'redux-thunk';
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
  config: getTopicConfigByParamName(state, topicName),
  isFetched: getTopicConfigFetched(state),
  isTopicUpdated: false,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, Action>,
  { history }: OwnProps
) => ({
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) =>
    dispatch(fetchTopicConfig(clusterName, topicName)),
  updateTopic: (clusterName: ClusterName, form: TopicFormData) => {
    dispatch(updateTopic(clusterName, form));
  },
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => {
    history.push(clusterTopicPath(clusterName, topicName));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Edit));
