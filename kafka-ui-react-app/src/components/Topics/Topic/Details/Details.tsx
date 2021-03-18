import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { Topic, TopicDetails } from 'generated-sources';
import { NavLink, Switch, Route, Link } from 'react-router-dom';
import {
  clusterTopicSettingsPath,
  clusterTopicPath,
  clusterTopicMessagesPath,
  clusterTopicsTopicEditPath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import OverviewContainer from './Overview/OverviewContainer';
import MessagesContainer from './Messages/MessagesContainer';
import SettingsContainer from './Settings/SettingsContainer';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
}

const Details: React.FC<Props> = ({ clusterName, topicName }) => {
  const { isReadOnly } = React.useContext(ClusterContext);

  return (
    <div className="box">
      <nav className="navbar" role="navigation">
        <div className="navbar-start">
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
        </div>
        <div className="navbar-end">
          {!isReadOnly && (
            <Link
              to={clusterTopicsTopicEditPath(clusterName, topicName)}
              className="button"
            >
              Edit settings
            </Link>
          )}
        </div>
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
  );
};

export default Details;
