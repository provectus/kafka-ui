import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListContainer from './List/ListContainer';

interface Props {
  clusterName: ClusterName;
  isFetched: boolean;
  fetchConsumerGroupsList: (clusterName: ClusterName) => void;
}

const ConsumerGroups: React.FC<Props> = ({
  clusterName,
  isFetched,
  fetchConsumerGroupsList,
}) => {
  React.useEffect(() => {
    fetchConsumerGroupsList(clusterName);
  }, [fetchConsumerGroupsList, clusterName]);

  if (isFetched) {
    return (
      <Switch>
        <Route
          exact
          path="/ui/clusters/:clusterName/consumer-groups"
          component={ListContainer}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default ConsumerGroups;
