import { connect } from 'react-redux';
import { RootState } from '../../redux/interfaces';
import { fetchSchemasByClusterName } from '../../redux/actions';
import Schemas from './Schemas';
import { getIsSchemaListFetched } from '../../redux/reducers/schemas/selectors';

const mapStateToProps = (state: RootState) => ({
  isFetched: getIsSchemaListFetched(state),
});

const mapDispatchToProps = {
  fetchSchemasByClusterName,
};

export default connect(mapStateToProps, mapDispatchToProps)(Schemas);
