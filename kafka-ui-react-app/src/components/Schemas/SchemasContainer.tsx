import { connect } from 'react-redux';
import { RootState, ClusterName } from 'redux/interfaces';
import { fetchSchemasByClusterName } from 'redux/actions';
import { getIsSchemaListFetching } from 'redux/reducers/schemas/selectors';
import { getClustersReadonlyStatus } from 'redux/reducers/clusters/selectors';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Schemas from './Schemas';

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
  isFetching: getIsSchemaListFetching(state),
  isReadOnly: getClustersReadonlyStatus(clusterName)(state),
});

const mapDispatchToProps = {
  fetchSchemasByClusterName,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Schemas)
);
