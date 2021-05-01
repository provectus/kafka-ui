import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchSchemasByClusterName,
  fetchGlobalSchemaCompatibilityLevel,
  updateGlobalSchemaCompatibilityLevel,
} from 'redux/actions';
import {
  getIsSchemaListFetching,
  getSchemaList,
  getGlobalSchemaCompatibilityLevel,
  getGlobalSchemaCompatibilityLevelFetched,
} from 'redux/reducers/schemas/selectors';

import List from './List';

const mapStateToProps = (state: RootState) => ({
  isFetching: getIsSchemaListFetching(state),
  schemas: getSchemaList(state),
  globalSchemaCompatibilityLevel: getGlobalSchemaCompatibilityLevel(state),
  isGlobalSchemaCompatibilityLevelFetched: getGlobalSchemaCompatibilityLevelFetched(
    state
  ),
});

const mapDispatchToProps = {
  fetchGlobalSchemaCompatibilityLevel,
  fetchSchemasByClusterName,
  updateGlobalSchemaCompatibilityLevel,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
