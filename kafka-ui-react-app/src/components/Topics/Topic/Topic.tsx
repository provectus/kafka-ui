import React from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { clusterTopicPath, clusterTopicsPath } from 'lib/paths';
import { ClusterName, TopicName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import EditContainer from 'components/Topics/Topic/Edit/EditContainer';
import DetailsContainer from 'components/Topics/Topic/Details/DetailsContainer';
import PageLoader from 'components/common/PageLoader/PageLoader';

interface RouterParams {
  clusterName: ClusterName;
  topicName: TopicName;
}

interface TopicProps {
  isTopicFetching: boolean;
  fetchTopicDetails: (clusterName: ClusterName, topicName: TopicName) => void;
}

const Topic: React.FC<TopicProps> = ({
  isTopicFetching,
  fetchTopicDetails,
}) => {
  const { clusterName, topicName } = useParams<RouterParams>();

  React.useEffect(() => {
    fetchTopicDetails(clusterName, topicName);
  }, [fetchTopicDetails, clusterName, topicName]);

  const rootBreadcrumbLinks = [
    {
      href: clusterTopicsPath(clusterName),
      label: 'All Topics',
    },
  ];

  const childBreadcrumbLinks = [
    ...rootBreadcrumbLinks,
    {
      href: clusterTopicPath(clusterName, topicName),
      label: topicName,
    },
  ];

  const topicPageUrl = '/ui/clusters/:clusterName/topics/:topicName';

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Switch>
            <Route exact path={`${topicPageUrl}/edit`}>
              <Breadcrumb links={childBreadcrumbLinks}>Edit</Breadcrumb>
            </Route>
            <Route path={topicPageUrl}>
              <Breadcrumb links={rootBreadcrumbLinks}>{topicName}</Breadcrumb>
            </Route>
          </Switch>
        </div>
      </div>
      {isTopicFetching ? (
        <PageLoader />
      ) : (
        <Switch>
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
      )}
    </div>
  );
};

export default Topic;
