import { connect } from 'react-redux';
import { fetchTopicsList } from 'redux/actions';
import { getIsTopicListFetched } from 'redux/reducers/topics/selectors';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { getClustersReadonlyStatus } from 'redux/reducers/clusters/selectors';
import Topics from './Topics';

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
  isFetched: getIsTopicListFetched(state),
  clusterName,
  isReadOnly: getClustersReadonlyStatus(clusterName)(state),
});

const mapDispatchToProps = {
  fetchTopicsList: (clusterName: ClusterName) => fetchTopicsList(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(Topics);
