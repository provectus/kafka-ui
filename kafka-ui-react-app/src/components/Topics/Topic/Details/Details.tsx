import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { Topic, TopicDetails } from 'generated-sources';
import { NavLink, Switch, Route, Link, useHistory } from 'react-router-dom';
import {
  clusterTopicSettingsPath,
  clusterTopicPath,
  clusterTopicMessagesPath,
  clusterTopicsPath,
  clusterTopicConsumerGroupsPath,
  clusterTopicEditPath,
  clusterTopicSendMessagePath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useDispatch } from 'react-redux';
import { deleteTopicAction } from 'redux/actions';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';

import OverviewContainer from './Overview/OverviewContainer';
import TopicConsumerGroupsContainer from './ConsumerGroups/TopicConsumerGroupsContainer';
import SettingsContainer from './Settings/SettingsContainer';
import Messages from './Messages/Messages';
import Navbar from './Navigation/Navbar.styled';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  isInternal: boolean;
  isDeleted: boolean;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  clearTopicMessages(clusterName: ClusterName, topicName: TopicName): void;
}

const Details: React.FC<Props> = ({
  clusterName,
  topicName,
  isInternal,
  isDeleted,
  deleteTopic,
  clearTopicMessages,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const [isDeleteTopicConfirmationVisible, setDeleteTopicConfirmationVisible] =
    React.useState(false);
  const deleteTopicHandler = React.useCallback(() => {
    deleteTopic(clusterName, topicName);
  }, [clusterName, topicName]);

  React.useEffect(() => {
    if (isDeleted) {
      dispatch(deleteTopicAction.cancel());
      history.push(clusterTopicsPath(clusterName));
    }
  }, [isDeleted]);

  const clearTopicMessagesHandler = React.useCallback(() => {
    clearTopicMessages(clusterName, topicName);
  }, [clusterName, topicName]);

  return (
    <div>
      <PageHeading text={topicName}>
        <Route
          exact
          path="/ui/clusters/:clusterName/topics/:topicName/messages"
        >
          <Button
            buttonSize="M"
            buttonType="primary"
            isLink
            to={clusterTopicSendMessagePath(clusterName, topicName)}
          >
            Produce message
          </Button>
        </Route>
      </PageHeading>
      <Navbar role="navigation">
        <NavLink
          exact
          to={clusterTopicPath(clusterName, topicName)}
          activeClassName="is-active is-primary"
        >
          Overview
        </NavLink>
        <NavLink
          exact
          to={clusterTopicMessagesPath(clusterName, topicName)}
          activeClassName="is-active"
        >
          Messages
        </NavLink>
        <NavLink
          exact
          to={clusterTopicConsumerGroupsPath(clusterName, topicName)}
          activeClassName="is-active"
        >
          Consumers
        </NavLink>
        <NavLink
          exact
          to={clusterTopicSettingsPath(clusterName, topicName)}
          activeClassName="is-active"
        >
          Settings
        </NavLink>
        {/* <div className="navbar-end">
          {!isReadOnly && !isInternal ? (
            <div className="buttons">
              <>
                <button
                  type="button"
                  className="button is-danger"
                  onClick={clearTopicMessagesHandler}
                >
                  Clear All Messages
                </button>
                {isTopicDeletionAllowed && (
                  <button
                    className="button is-danger"
                    type="button"
                    onClick={() => setDeleteTopicConfirmationVisible(true)}
                  >
                    Delete Topic
                  </button>
                )}

                <Link
                  to={clusterTopicSendMessagePath(clusterName, topicName)}
                  className="button"
                >
                  Produce message
                </Link>

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
            </div>
          ) : null}
        </div> */}
      </Navbar>
      <Switch>
        <Route
          exact
          path="/ui/clusters/:clusterName/topics/:topicName/messages"
          component={Messages}
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
        <Route
          exact
          path="/ui/clusters/:clusterName/topics/:topicName/consumergroups"
          component={TopicConsumerGroupsContainer}
        />
      </Switch>
    </div>
  );
};

export default Details;
