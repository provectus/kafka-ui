import React from 'react';
import { ClusterName } from 'redux/interfaces';
import useInterval from 'lib/hooks/useInterval';
import { NavLink, Route, Switch, useParams } from 'react-router-dom';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { BrokersApi, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import * as Metrics from 'components/common/Metrics';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchBrokers,
  fetchClusterStats,
  selectStats,
} from 'redux/reducers/brokers/brokersSlice';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import Navbar from 'components/common/Navigation/Navbar.styled';
import { clusterBrokerMetricsPath, clusterBrokerPath } from 'lib/paths';
import BrokerLogdir from 'components/Brokers/Broker/Logdir/BrokerLogdir';
import BrokerMetrics from 'components/Brokers/Broker/Metrics/BrokerMetrics';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

const Broker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName, brokerId } =
    useParams<{ clusterName: ClusterName; brokerId: string }>();
  const { diskUsage, items } = useAppSelector(selectStats);

  React.useEffect(() => {
    dispatch(fetchClusterStats(clusterName));
    dispatch(fetchBrokers(clusterName));
  }, []);

  const brokerItem = items?.find(
    (item) => Number(item.id) === Number(brokerId)
  );
  const brokerDiskUsage = diskUsage?.find(
    (item) => Number(item.brokerId) === Number(brokerId)
  );

  useInterval(() => {
    fetchClusterStats(clusterName);
    fetchBrokers(clusterName);
  }, 5000);
  return (
    <>
      <PageHeading text={`Broker ${brokerId}`} />
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Segment Size">
            <BytesFormatted value={brokerDiskUsage?.segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {brokerDiskUsage?.segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Port">{brokerItem?.port}</Metrics.Indicator>
          <Metrics.Indicator label="Host">{brokerItem?.host}</Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <Navbar role="navigation">
        <NavLink
          exact
          to={clusterBrokerPath(clusterName, brokerId)}
          activeClassName="is-active is-primary"
        >
          Log dir
        </NavLink>
        <NavLink
          exact
          to={clusterBrokerMetricsPath(clusterName, brokerId)}
          activeClassName="is-active"
        >
          Metrics
        </NavLink>
      </Navbar>
      <Switch>
        <Route
          exact
          path={clusterBrokerPath(':clusterName', ':brokerId')}
          component={BrokerLogdir}
        />
        <Route
          exact
          path={clusterBrokerMetricsPath(':clusterName', ':brokerId')}
          component={BrokerMetrics}
        />
      </Switch>
    </>
  );
};

export default Broker;
