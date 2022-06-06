import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getAreSchemaVersionsFulfilled,
  selectAllSchemaVersions,
} from 'redux/reducers/schemas/schemasSlice';

import Diff from './Diff';

const mapStateToProps = (state: RootState) => ({
  versions: selectAllSchemaVersions(state),
  areVersionsFetched: getAreSchemaVersionsFulfilled(state),
});

export default connect(mapStateToProps)(Diff);
