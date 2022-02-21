import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  getAreSchemaVersionsFulfilled,
  selectAllSchemaVersions,
} from 'redux/reducers/schemas/schemasSlice';

import Diff from './Diff';

interface RouteProps {
  leftVersion?: string;
  rightVersion?: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { leftVersion, rightVersion },
    },
  }: OwnProps
) => ({
  versions: selectAllSchemaVersions(state),
  areVersionsFetched: getAreSchemaVersionsFulfilled(state),
  leftVersionInPath: leftVersion,
  rightVersionInPath: rightVersion,
});

export default withRouter(connect(mapStateToProps)(Diff));
