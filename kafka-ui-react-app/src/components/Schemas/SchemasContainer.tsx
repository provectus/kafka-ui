import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { fetchSchemasByClusterName } from 'redux/actions';
import { getIsSchemaListFetched } from 'redux/reducers/schemas/selectors';
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
  isFetched: getIsSchemaListFetched(state),
  clusterName,
});

const mapDispatchToProps = {
  fetchSchemasByClusterName,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Schemas)
);
