import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  getIsSchemaVersionFetched,
  getSortedSchemaVersions,
} from 'redux/reducers/schemas/selectors';
import { fetchSchemaVersions } from 'redux/actions';

import Diff from './Diff';

interface RouteProps {
  clusterName: ClusterName;
  subject: string;
  leftVersion?: string;
  rightVersion?: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { clusterName, subject, leftVersion, rightVersion },
    },
  }: OwnProps
) => ({
  subject,
  versions: getSortedSchemaVersions(state),
  areVersionsFetched: getIsSchemaVersionFetched(state),
  clusterName,
  leftVersionInPath: leftVersion,
  rightVersionInPath: rightVersion,
});

const mapDispatchToProps = {
  fetchSchemaVersions,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Diff));
