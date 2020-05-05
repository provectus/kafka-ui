import React from 'react';
import { ClusterName, Topic, TopicDetails, TopicName } from 'redux/interfaces';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { NavLink, Switch, Route } from 'react-router-dom';
import {
  clusterTopicsPath,
  clusterTopicSettingsPath,
  clusterTopicPath,
  clusterTopicMessagesPath,
  clusterTopicsTopicEditPath,
} from 'lib/paths';
import OverviewContainer from './Overview/OverviewContainer';
import MessagesContainer from './Messages/MessagesContainer';
import SettingsContainer from './Settings/SettingsContainer';
import SettingsEditButton from './Settings/SettingsEditButton';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
}

const Details: React.FC<Props> = ({ clusterName, topicName }) => {
  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb
            links={[
              { href: clusterTopicsPath(clusterName), label: 'All Topics' },
            ]}
          >
            {topicName}
          </Breadcrumb>
        </div>
        <SettingsEditButton
          to={clusterTopicsTopicEditPath(clusterName, topicName)}
        />
      </div>

      <div className="box">
        <nav className="navbar" role="navigation">
          <NavLink
            exact
            to={clusterTopicPath(clusterName, topicName)}
            className="navbar-item is-tab"
            activeClassName="is-active is-primary"
          >
            Overview
          </NavLink>
          <NavLink
            exact
            to={clusterTopicMessagesPath(clusterName, topicName)}
            className="navbar-item is-tab"
            activeClassName="is-active"
          >
            Messages
          </NavLink>
          <NavLink
            exact
            to={clusterTopicSettingsPath(clusterName, topicName)}
            className="navbar-item is-tab"
            activeClassName="is-active"
          >
            Settings
          </NavLink>
        </nav>
        <br />
        <Switch>
          <Route
            exact
            path="/ui/clusters/:clusterName/topics/:topicName/messages"
            component={MessagesContainer}
          />
          <Route
            exact
            path="/ui/clusters/:clusterName/topics/:topicName/settings"
            component={SettingsContainer}
          />
          <Route
            exact
            path="/ui/clusters/:clusterName/topics/:topicName"
            component={OverviewContainer}
          />
        </Switch>
      </div>
    </div>
  );
};

export default Details;
