import { connect } from 'react-redux';
import { fetchTopicsList } from 'redux/actions';
import Topics from './Topics';
import { getIsTopicListFetched } from 'redux/reducers/topics/selectors';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterName: ClusterName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterName } }}: OwnProps) => ({
  isFetched: getIsTopicListFetched(state),
  clusterName,
});

const mapDispatchToProps = {
  fetchTopicsList: (clusterName: ClusterName) => fetchTopicsList(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(Topics);
