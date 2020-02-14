import { connect } from 'react-redux';
import Messages from './Messages';
import { RootState } from 'redux/interfaces';
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
  connect(mapStateToProps)(Messages)
);
