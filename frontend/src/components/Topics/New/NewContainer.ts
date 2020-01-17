import { connect } from 'react-redux';
import { RootState } from 'types';
import New from './New';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterId } } }: OwnProps) => ({
  clusterId,
});


export default withRouter(
  connect(mapStateToProps)(New)
);
