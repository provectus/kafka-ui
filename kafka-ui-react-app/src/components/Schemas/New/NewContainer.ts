import { connect } from 'react-redux';
import { createSchema } from 'redux/actions';

import New from './New';

const mapDispatchToProps = {
  createSchema,
};

export default connect(null, mapDispatchToProps)(New);
