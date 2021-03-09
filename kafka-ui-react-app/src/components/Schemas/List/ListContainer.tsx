import { connect } from 'react-redux';
import { RootState, ClusterName } from 'redux/interfaces';
import { getSchemaList } from 'redux/reducers/schemas/selectors';
import { getClustersReadonlyStatus } from 'redux/reducers/clusters/selectors';
import { RouteComponentProps, withRouter } from 'react-router-dom';
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
  schemas: getSchemaList(state),
  isReadOnly: getClustersReadonlyStatus(clusterName)(state),
});

export default withRouter(connect(mapStateToProps)(List));
