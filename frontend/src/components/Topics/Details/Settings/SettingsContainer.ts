import { connect } from 'react-redux';
import {
  fetchTopicDetails,
} from 'redux/reducers/topics/thunks';
import Settings from './Settings';
import { RootState } from 'types';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
  topicName: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { topicName, clusterId } } }: OwnProps) => ({
  clusterId,
  topicName,
});

export default withRouter(
  connect(mapStateToProps)(Settings)
);
