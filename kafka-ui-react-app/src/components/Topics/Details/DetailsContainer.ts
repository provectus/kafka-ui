import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Details from './Details';

interface RouteProps {
  clusterName: ClusterName;
  topicName: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { topicName, clusterName },
    },
  }: OwnProps
) => ({
  clusterName,
  topicName,
});

export default withRouter(connect(mapStateToProps)(Details));
