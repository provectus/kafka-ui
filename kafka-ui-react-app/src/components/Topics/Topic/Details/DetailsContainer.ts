import { connect } from 'react-redux';
import { ClusterName, RootState, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { deleteTopic, clearTopicMessages } from 'redux/actions';
import {
  getIsTopicInternal,
  getIsTopicDeleted,
} from 'redux/reducers/topics/selectors';

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
  isInternal: getIsTopicInternal(state, topicName),
  isDeleted: getIsTopicDeleted(state),
});

const mapDispatchToProps = {
  deleteTopic,
  clearTopicMessages,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Details)
);
