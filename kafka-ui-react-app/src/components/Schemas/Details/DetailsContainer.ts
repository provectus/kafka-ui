import { connect } from 'react-redux';
import { ClusterName, RootState, TopicName } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getSchema, getSchemaList } from 'redux/reducers/schemas/selectors';
import Details from './Details';
import {
  fetchSchemasByClusterName,
  fetchSchemaVersions,
} from '../../../redux/actions';

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
  schema: getSchema(state, subject),
  // versions: getSchemasVersions(state, subject),
  clusterName,
  subject,
});

const mapDispatchToProps = {
  fetchSchemaVersions,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Details)
);
