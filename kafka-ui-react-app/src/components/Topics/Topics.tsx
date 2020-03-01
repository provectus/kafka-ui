import React from 'react';
import { ClusterName } from 'redux/interfaces';
import {
  Switch,
  Route,
} from 'react-router-dom';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';
import NewContainer from './New/NewContainer';

interface Props {
  clusterName: ClusterName;
  isFetched: boolean;
  fetchBrokers: (clusterName: ClusterName) => void;
  fetchTopicList: (clusterName: ClusterName) => void;
}

const Topics: React.FC<Props> = ({
  clusterName,
  isFetched,
  fetchTopicList,
}) => {
  React.useEffect(() => { fetchTopicList(clusterName); }, [fetchTopicList, clusterName]);

  if (isFetched) {
    return (
      <Switch>
        <Route exact path="/clusters/:clusterName/topics" component={ListContainer} />
        <Route exact path="/clusters/:clusterName/topics/new" component={NewContainer} />
        <Route path="/clusters/:clusterName/topics/:topicName" component={DetailsContainer} />
      </Switch>
    );
  }

  return (<PageLoader />);
};

export default Topics;
