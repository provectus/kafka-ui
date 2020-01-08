import { connect } from 'react-redux';
import {
  fetchTopicList,
} from 'redux/reducers/topics/thunks';
import Details from './Details';
import { RootState } from 'types';
import { getTopicByName } from 'redux/reducers/topics/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
  topicName: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterId } } }: OwnProps) => ({
  clusterId,
  ...getTopicByName(state, topicName),
});

const mapDispatchToProps = {
  fetchTopicList,
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Details)
);
