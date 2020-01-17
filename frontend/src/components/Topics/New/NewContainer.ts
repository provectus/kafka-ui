import { connect } from 'react-redux';
import { RootState, ClusterId, TopicFormData, TopicName, Action } from 'types';
import New from './New';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { createTopic } from 'redux/reducers/topics/thunks';
import { getTopicCreated } from 'redux/reducers/topics/selectors';
import { clusterTopicPath } from 'lib/paths';
import { ThunkDispatch } from 'redux-thunk';

interface RouteProps {
  clusterId: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterId } } }: OwnProps) => ({
  clusterId,
  isTopicCreated: getTopicCreated(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, undefined, Action>, { history }: OwnProps) => ({
  createTopic: (clusterId: ClusterId, form: TopicFormData) => {
    dispatch(createTopic(clusterId, form))
  },
  redirectToTopicPath: (clusterId: ClusterId, topicName: TopicName) => {
    history.push(clusterTopicPath(clusterId, topicName));
  }
});


export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(New)
);
