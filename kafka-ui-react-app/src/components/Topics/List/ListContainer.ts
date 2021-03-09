import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import {
  getTopicList,
  getExternalTopicList,
} from 'redux/reducers/topics/selectors';
import { getClustersReadonlyStatus } from 'redux/reducers/clusters/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import List from './List';

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
  clusterName,
  topics: getTopicList(state),
  externalTopics: getExternalTopicList(state),
  isReadOnly: getClustersReadonlyStatus(clusterName)(state),
});

export default withRouter(connect(mapStateToProps)(List));
