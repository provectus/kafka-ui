import { connect } from 'react-redux';
import {ClusterName, RootState} from 'redux/interfaces';
import { getTopicList, getExternalTopicList } from 'redux/reducers/topics/selectors';
import List from './List';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterName: ClusterName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterName } } }: OwnProps) => ({
  clusterName,
  topics: getTopicList(state),
  externalTopics: getExternalTopicList(state),
});

export default withRouter(
  connect(mapStateToProps)(List)
);
