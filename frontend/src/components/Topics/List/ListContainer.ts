import { connect } from 'react-redux';
import { RootState } from 'lib/interfaces';
import { getTopicList, getExternalTopicList } from 'redux/reducers/topics/selectors';
import List from './List';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterId } } }: OwnProps) => ({
  clusterId,
  topics: getTopicList(state),
  externalTopics: getExternalTopicList(state),
});

export default withRouter(
  connect(mapStateToProps)(List)
);
