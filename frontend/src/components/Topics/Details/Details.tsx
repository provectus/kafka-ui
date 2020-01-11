import React from 'react';
import cx from 'classnames';
import { ClusterId, Topic, TopicDetails, TopicName } from 'types';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { NavLink, Switch, Route } from 'react-router-dom';
import { clusterTopicsPath, clusterTopicSettingsPath, clusterTopicPath, clusterTopicMessagesPath } from 'lib/paths';
import OverviewContainer from './Overview/OverviewContainer';
import MessagesContainer from './Messages/MessagesContainer';
import SettingsContainer from './Settings/SettingsContainer';

interface Props extends Topic, TopicDetails {
  clusterId: ClusterId;
  topicName: TopicName;
  fetchTopicDetails: (clusterId: ClusterId, topicName: TopicName) => void;
}

const Details: React.FC<Props> = ({
  clusterId,
  topicName,
}) => {
  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb links={[
            { href: clusterTopicsPath(clusterId), label: 'All Topics' },
          ]}>
            {topicName}
          </Breadcrumb>
        </div>
        <div className="level-item level-right">

        </div>
      </div>

      <div className="box">
        <div className="tabs">
          <ul>
            <li className="is-active">
              <NavLink exact to={clusterTopicPath(clusterId, topicName)}>Overview</NavLink>
            </li>
            <li>
              <NavLink exact to={clusterTopicMessagesPath(clusterId, topicName)}>Messages</NavLink>
            </li>
            <li>
              <NavLink exact to={clusterTopicSettingsPath(clusterId, topicName)}>Settings</NavLink>
            </li>
          </ul>
        </div>

        <Switch>
          <Route exact path="/clusters/:clusterId/topics/:topicName/messages" component={MessagesContainer} />
          <Route exact path="/clusters/:clusterId/topics/:topicName/settings" component={SettingsContainer} />
          <Route exact path="/clusters/:clusterId/topics/:topicName" component={OverviewContainer} />
        </Switch>
      </div>
    </div>
  );
}

export default Details;
