import { connect } from 'react-redux';
import { fetchTopicList } from 'redux/actions';
import { getIsTopicListFetched } from 'redux/reducers/topics/selectors';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
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
});

const mapDispatchToProps = {
  fetchTopicList: (clusterName: ClusterName) => fetchTopicList(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(Topics);
