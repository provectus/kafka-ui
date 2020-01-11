import { connect } from 'react-redux';
import {
  fetchTopicDetails,
} from 'redux/reducers/topics/thunks';
import Overview from './Overview';
import { RootState, TopicName, ClusterId } from 'types';
import { getTopicByName, getIsTopicDetailsFetched } from 'redux/reducers/topics/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
  topicName: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterId } } }: OwnProps) => ({
  clusterId,
  topicName,
  isFetched: getIsTopicDetailsFetched(state),
  ...getTopicByName(state, topicName),
});

const mapDispatchToProps = {
  fetchTopicDetails: (clusterId: ClusterId, topicName: TopicName) => fetchTopicDetails(clusterId, topicName),
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Overview)
);
