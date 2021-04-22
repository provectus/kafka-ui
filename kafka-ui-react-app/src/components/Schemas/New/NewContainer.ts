import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { createSchema } from 'redux/actions';
import { getSchemaCreated } from 'redux/reducers/schemas/selectors';

import New from './New';

const mapStateToProps = (state: RootState) => ({
  isSchemaCreated: getSchemaCreated(state),
});

const mapDispatchToProps = {
  createSchema,
};

export default connect(mapStateToProps, mapDispatchToProps)(New);
