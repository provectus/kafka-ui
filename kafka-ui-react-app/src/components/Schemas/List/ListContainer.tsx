import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { getSchemaList } from 'redux/reducers/schemas/selectors';
import List from './List';

const mapStateToProps = (state: RootState) => ({
  schemas: getSchemaList(state),
});

export default connect(mapStateToProps)(List);
