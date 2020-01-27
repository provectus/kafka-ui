import { connect } from 'react-redux';
import { fetchTopicList } from 'redux/reducers/topics/thunks';
import Topics from './Topics';
import { getIsTopicListFetched } from 'redux/reducers/topics/selectors';
import { RootState, ClusterId } from 'lib/interfaces';
import { RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterId } }}: OwnProps) => ({
  isFetched: getIsTopicListFetched(state),
  clusterId,
});

const mapDispatchToProps = {
  fetchTopicList: (clusterId: ClusterId) => fetchTopicList(clusterId),
}

export default connect(mapStateToProps, mapDispatchToProps)(Topics);
