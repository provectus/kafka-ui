import React from 'react';
import { ClusterId } from 'types';
import {
  Switch,
  Route,
} from 'react-router-dom';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';
import NewContainer from './New/NewContainer';

interface Props {
  clusterId: string;
  isFetched: boolean;
  fetchBrokers: (clusterId: ClusterId) => void;
  fetchTopicList: (clusterId: ClusterId) => void;
}

const Topics: React.FC<Props> = ({
  clusterId,
  isFetched,
  fetchTopicList,
}) => {
  React.useEffect(() => { fetchTopicList(clusterId); }, [fetchTopicList, clusterId]);

  if (isFetched) {
    return (
      <Switch>
        <Route exact path="/clusters/:clusterId/topics" component={ListContainer} />
        <Route exact path="/clusters/:clusterId/topics/new" component={NewContainer} />
        <Route path="/clusters/:clusterId/topics/:topicName" component={DetailsContainer} />
      </Switch>
    );
  }

  return (<PageLoader />);
}

export default Topics;
