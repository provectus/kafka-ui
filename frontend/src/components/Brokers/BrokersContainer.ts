import { connect } from 'react-redux';
import {
  fetchBrokers,
  fetchBrokerMetrics,
} from 'redux/reducers/brokers/thunks';
import Brokers from './Brokers';
import { getIsBrokerListFetched } from 'redux/reducers/brokers/selectors';
import { RootState, ClusterId } from 'types';
import { RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterId } }}: OwnProps) => ({
  isFetched: getIsBrokerListFetched(state),
  clusterId,
});

const mapDispatchToProps = {
  fetchBrokers: (clusterId: ClusterId) => fetchBrokers(clusterId),
  fetchBrokerMetrics: (clusterId: ClusterId) => fetchBrokerMetrics(clusterId),
}

export default connect(mapStateToProps, mapDispatchToProps)(Brokers);
