import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import EditContainer from 'components/Topics/Edit/EditContainer';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import NewContainer from './New/NewContainer';
import ReadOnlyContext from '../contexts/ReadOnlyContext';

interface Props {
  clusterName: ClusterName;
  isFetched: boolean;
  fetchBrokers: (clusterName: ClusterName) => void;
  fetchTopicsList: (clusterName: ClusterName) => void;
  isReadOnly?: boolean | undefined;
}

const Topics: React.FC<Props> = ({
  clusterName,
  isFetched,
  fetchTopicsList,
  isReadOnly,
}) => {
  React.useEffect(() => {
    fetchTopicsList(clusterName);
  }, [fetchTopicsList, clusterName]);

  if (isFetched) {
    return (
      <ReadOnlyContext.Provider value={{ isReadOnly }}>
        <Switch>
          <Route
            exact
            path="/ui/clusters/:clusterName/topics"
            component={ListContainer}
          />
          <Route
            exact
            path="/ui/clusters/:clusterName/topics/new"
            component={NewContainer}
          />
          <Route
            exact
            path="/ui/clusters/:clusterName/topics/:topicName/edit"
            component={EditContainer}
          />
          <Route
            path="/ui/clusters/:clusterName/topics/:topicName"
            component={DetailsContainer}
          />
        </Switch>
      </ReadOnlyContext.Provider>
    );
  }

  return <PageLoader />;
};

export default Topics;
