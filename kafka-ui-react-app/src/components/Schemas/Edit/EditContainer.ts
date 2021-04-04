import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  getIsSchemaListFetched,
  getSchema,
} from 'redux/reducers/schemas/selectors';
import {
  createSchema,
  fetchSchemasByClusterName,
  updateSchemaCompatibilityLevel,
} from 'redux/actions';
import Edit from './Edit';

interface RouteProps {
  clusterName: ClusterName;
  subject: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { clusterName, subject },
    },
  }: OwnProps
) => ({
  subject,
  schema: getSchema(state, subject),
  schemasAreFetched: getIsSchemaListFetched(state),
  clusterName,
});

const mapDispatchToProps = {
  createSchema,
  fetchSchemasByClusterName,
  updateSchemaCompatibilityLevel,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Edit));
