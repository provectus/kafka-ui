import { connect } from 'react-redux';
import {
  fetchTopicDetails,
} from 'redux/actions';
import Overview from './Overview';
import { RootState, TopicName, ClusterName } from 'redux/interfaces';
import { getTopicByName, getIsTopicDetailsFetched } from 'redux/reducers/topics/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterName } } }: OwnProps) => ({
  clusterName,
  topicName,
  isFetched: getIsTopicDetailsFetched(state),
  ...getTopicByName(state, topicName),
});

const mapDispatchToProps = {
  fetchTopicDetails: (clusterName: ClusterName, topicName: TopicName) => fetchTopicDetails(clusterName, topicName),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Overview)
);
