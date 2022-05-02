import { connect } from 'react-redux';
import { RootState, TopicConfigByName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import CustomParams from './CustomParams';

interface OwnProps extends RouteComponentProps {
  isSubmitting: boolean;
  config?: TopicConfigByName;
}

const mapStateToProps = (
  _state: RootState,
  { isSubmitting, config }: OwnProps
) => ({
  isSubmitting,
  config,
});

export default withRouter(connect(mapStateToProps)(CustomParams));
