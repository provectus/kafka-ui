import { connect } from 'react-redux';
import { RootState, ClusterName, TopicName, Action } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ThunkDispatch } from 'redux-thunk';
import { deleteTopic } from 'redux/actions';
import ListItem from './ListItem';

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
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, Action>
) => ({
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => {
    dispatch(deleteTopic(clusterName, topicName));
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ListItem)
);
