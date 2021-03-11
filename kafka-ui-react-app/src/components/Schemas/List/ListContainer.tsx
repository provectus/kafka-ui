import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchSchemasByClusterName } from 'redux/actions';
import {
  getIsSchemaListFetching,
  getSchemaList,
} from 'redux/reducers/schemas/selectors';
import List from './List';

const mapStateToProps = (state: RootState) => ({
  isFetching: getIsSchemaListFetching(state),
  schemas: getSchemaList(state),
});

const mapDispatchToProps = {
  fetchSchemasByClusterName,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
