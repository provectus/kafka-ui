import { connect } from 'react-redux';
import {
  RootState,
  ClusterName,
  TopicName,
  Action,
  TopicFormDataRaw,
} from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { createTopic } from 'redux/actions';
import { getTopicCreated } from 'redux/reducers/topics/selectors';
import { clusterTopicPath } from 'lib/paths';
import { ThunkDispatch } from 'redux-thunk';
import * as actions from 'redux/actions';
import New from './New';

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
  isTopicCreated: getTopicCreated(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, Action>,
  { history }: OwnProps
) => ({
  createTopic: (clusterName: ClusterName, form: TopicFormDataRaw) => {
    dispatch(createTopic(clusterName, form));
  },
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => {
    history.push(clusterTopicPath(clusterName, topicName));
  },
  resetUploadedState: () => dispatch(actions.createTopicAction.failure()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(New));
