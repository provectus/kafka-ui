import { connect } from 'react-redux';
import { fetchConsumerGroupsList } from 'redux/actions';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { getIsConsumerGroupsListFetched } from 'redux/reducers/consumerGroups/selectors';
import ConsumerGroups from './ConsumerGroups';

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
  isFetched: getIsConsumerGroupsListFetched(state),
  clusterName,
});

const mapDispatchToProps = {
  fetchConsumerGroupsList: (clusterName: ClusterName) =>
    fetchConsumerGroupsList(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(ConsumerGroups);
