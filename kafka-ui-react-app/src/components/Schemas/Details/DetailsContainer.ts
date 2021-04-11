import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  getIsSchemaVersionFetched,
  getSchema,
  getSortedSchemaVersions,
} from 'redux/reducers/schemas/selectors';
import { fetchSchemaVersions, deleteSchema } from 'redux/actions';
import Details from './Details';

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
  versions: getSortedSchemaVersions(state),
  isFetched: getIsSchemaVersionFetched(state),
  clusterName,
});

const mapDispatchToProps = {
  fetchSchemaVersions,
  deleteSchema,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Details)
);
