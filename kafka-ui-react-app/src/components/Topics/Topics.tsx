import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ListContainer from './List/ListContainer';
import TopicContainer from './Topic/TopicContainer';
import NewContainer from './New/NewContainer';

const Topics: React.FC = () => (
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
      path="/ui/clusters/:clusterName/topics/:topicName"
      component={TopicContainer}
    />
  </Switch>
);

export default Topics;
