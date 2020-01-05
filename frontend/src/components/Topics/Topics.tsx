import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ClusterId } from 'types';

interface Props {
  clusterId: string;
  isFetched: boolean;
  fetchBrokers: (clusterId: ClusterId) => void;
  fetchTopicList: (clusterId: ClusterId) => void;
}

const Topics: React.FC<Props> = ({
  clusterId,
  isFetched,
  fetchBrokers,
  fetchTopicList,
}) => {
  React.useEffect(() => { fetchTopicList(clusterId); }, [fetchTopicList, clusterId]);
  // React.useEffect(() => { fetchBrokers(clusterId); }, [fetchBrokers, clusterId]);

  if (isFetched) {
    return (
      <Switch>
        <Route exact path="/clusters/:clusterId/topics/:topicName" component={DetailsContainer} />
        <Route exact path="/clusters/:clusterId/topics" component={ListContainer} />
      </Switch>
    );
  }

  return (<PageLoader />);
}

export default Topics;
