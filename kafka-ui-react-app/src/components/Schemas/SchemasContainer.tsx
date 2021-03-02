import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchSchemasByClusterName } from 'redux/actions';
import { getIsSchemaListFetching } from 'redux/reducers/schemas/selectors';
import Schemas from './Schemas';

const mapStateToProps = (state: RootState) => ({
  isFetching: getIsSchemaListFetching(state),
});

const mapDispatchToProps = {
  fetchSchemasByClusterName,
};

export default connect(mapStateToProps, mapDispatchToProps)(Schemas);
