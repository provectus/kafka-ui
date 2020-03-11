import { connect } from 'react-redux';
import { fetchConsumerGroupsList } from 'redux/actions';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import ConsumerGroups from './ConsumerGroups';
import { getIsConsumerGroupsListFetched } from '../../redux/reducers/consumerGroups/selectors';


interface RouteProps {
  clusterName: ClusterName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterName } }}: OwnProps) => ({
  isFetched: getIsConsumerGroupsListFetched(state),
  clusterName,
});

const mapDispatchToProps = {
  fetchConsumerGroupsList: (clusterName: ClusterName) => fetchConsumerGroupsList(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(ConsumerGroups);
