import { connect } from 'react-redux';
import { ClusterName, RootState } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  getAreSchemaVersionsFulfilled,
  selectAllSchemaVersions,
} from 'redux/reducers/schemas/schemasSlice';

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
  versions: selectAllSchemaVersions(state),
  areVersionsFetched: getAreSchemaVersionsFulfilled(state),
  clusterName,
  leftVersionInPath: leftVersion,
  rightVersionInPath: rightVersion,
});

export default withRouter(connect(mapStateToProps)(Diff));
