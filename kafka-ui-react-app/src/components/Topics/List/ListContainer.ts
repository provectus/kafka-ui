import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import {
  getTopicList,
  getExternalTopicList,
} from 'redux/reducers/topics/selectors';
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
});

export default withRouter(connect(mapStateToProps)(List));
