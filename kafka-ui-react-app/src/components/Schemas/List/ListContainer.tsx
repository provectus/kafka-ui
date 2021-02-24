import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { withRouter } from 'react-router-dom';
import { getSchemaList } from 'redux/reducers/schemas/selectors';
import List from './List';

const mapStateToProps = (state: RootState) => ({
  schemas: getSchemaList(state),
});

export default withRouter(connect(mapStateToProps)(List));
