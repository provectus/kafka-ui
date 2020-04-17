import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import CustomParams from './CustomParams';

interface RouteProps {};

interface OwnProps extends RouteComponentProps<RouteProps> {
  isSubmitting: boolean;
}

const mapStateToProps = (state: RootState, { isSubmitting }: OwnProps) => ({
  isSubmitting,
})

export default withRouter(
  connect(mapStateToProps)(CustomParams)
);
