import React from 'react';
import { ClusterId, Topic, TopicDetails, TopicName } from 'lib/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { NavLink, Switch, Route } from 'react-router-dom';
import { clusterTopicsPath, clusterTopicSettingsPath, clusterTopicPath, clusterTopicMessagesPath } from 'lib/paths';
import OverviewContainer from './Overview/OverviewContainer';
import MessagesContainer from './Messages/MessagesContainer';
import SettingsContainer from './Settings/SettingsContainer';

interface Props extends Topic, TopicDetails {
  clusterId: ClusterId;
  topicName: TopicName;
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
      </div>

      <div className="box">
        <nav className="navbar" role="navigation">
          <NavLink
            exact
            to={clusterTopicPath(clusterId, topicName)}
            className="navbar-item is-tab"
            activeClassName="is-active is-primary"
          >
            Overview
          </NavLink>
          <NavLink
            exact
            to={clusterTopicMessagesPath(clusterId, topicName)}
            className="navbar-item is-tab"
            activeClassName="is-active"
          >
            Messages
          </NavLink>
          <NavLink
            exact
            to={clusterTopicSettingsPath(clusterId, topicName)}
            className="navbar-item is-tab"
            activeClassName="is-active"
          >
            Settings
          </NavLink>
        </nav>
        <br />
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
