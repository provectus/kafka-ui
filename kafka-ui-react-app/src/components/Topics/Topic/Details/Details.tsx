import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { Topic, TopicDetails } from 'generated-sources';
import { NavLink, Switch, Route, Link, useHistory } from 'react-router-dom';
import {
  clusterTopicSettingsPath,
  clusterTopicPath,
  clusterTopicMessagesPath,
  clusterTopicsPath,
  clusterTopicEditPath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import OverviewContainer from './Overview/OverviewContainer';
import MessagesContainer from './Messages/MessagesContainer';
import SettingsContainer from './Settings/SettingsContainer';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
}

const Details: React.FC<Props> = ({ clusterName, topicName, deleteTopic }) => {
  const history = useHistory();
  const { isReadOnly } = React.useContext(ClusterContext);
  const [
    isDeleteTopicConfirmationVisible,
    setDeleteTopicConfirmationVisible,
  ] = React.useState(false);
  const deleteTopicHandler = React.useCallback(() => {
    deleteTopic(clusterName, topicName);
    history.push(clusterTopicsPath(clusterName));
  }, [clusterName, topicName]);

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
          <div className="buttons">
            {!isReadOnly && (
              <>
                <button
                  className="button is-danger"
                  type="button"
                  onClick={() => setDeleteTopicConfirmationVisible(true)}
                >
                  Delete Topic
                </button>

                <Link
                  to={clusterTopicEditPath(clusterName, topicName)}
                  className="button"
                >
                  Edit settings
                </Link>

                <ConfirmationModal
                  isOpen={isDeleteTopicConfirmationVisible}
                  onCancel={() => setDeleteTopicConfirmationVisible(false)}
                  onConfirm={deleteTopicHandler}
                >
                  Are you sure want to remove <b>{topicName}</b> topic?
                </ConfirmationModal>
              </>
            )}
          </div>
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
