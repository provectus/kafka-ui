import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';

interface Props {
  isFetched: boolean;
  fetchBrokers: () => void;
  fetchTopicList: () => void;
}

const Topics: React.FC<Props> = ({
  isFetched,
  fetchBrokers,
  fetchTopicList,
}) => {
  React.useEffect(() => { fetchTopicList(); }, [fetchTopicList]);
  React.useEffect(() => { fetchBrokers(); }, [fetchBrokers]);

  if (isFetched) {
    return (
      <Switch>
        <Route exact path="/topics/:topicName" component={DetailsContainer} />
        <Route exact path="/topics" component={ListContainer} />
      </Switch>
    );
  }

  return (<PageLoader />);
}

export default Topics;
