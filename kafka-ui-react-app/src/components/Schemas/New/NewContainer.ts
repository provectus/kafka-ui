import { connect } from 'react-redux';
import { RootState, ClusterName, Action, SchemaName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { createSchema } from 'redux/actions';
import { clusterSchemaPath } from 'lib/paths';
import { ThunkDispatch } from 'redux-thunk';
import * as actions from 'redux/actions';
import { getSchemaCreated } from 'redux/reducers/schemas/selectors';
import { NewSchemaSubject } from 'generated-sources';
import New from './New';

interface RouteProps {
  clusterName: ClusterName;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { clusterName },
    },
  }: OwnProps
) => ({
  clusterName,
  isSchemaCreated: getSchemaCreated(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, Action>,
  { history }: OwnProps
) => ({
  createSchema: (
    clusterName: ClusterName,
    subject: SchemaName,
    newSchemaSubject: NewSchemaSubject
  ) => {
    dispatch(createSchema(clusterName, subject, newSchemaSubject));
  },
  redirectToSchemaPath: (clusterName: ClusterName, subject: SchemaName) => {
    history.push(clusterSchemaPath(clusterName, subject));
  },
  resetUploadedState: () => dispatch(actions.createSchemaAction.failure()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(New));
