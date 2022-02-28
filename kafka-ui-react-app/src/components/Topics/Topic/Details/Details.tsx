import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { Topic, TopicDetails } from 'generated-sources';
import { NavLink, Switch, Route, useHistory } from 'react-router-dom';
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
import Dropdown from 'components/common/Dropdown/Dropdown';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import styled from 'styled-components';
import Navbar from 'components/common/Navigation/Navbar.styled';
import * as S from 'components/Topics/Topic/Details/Details.styled';

import OverviewContainer from './Overview/OverviewContainer';
import TopicConsumerGroupsContainer from './ConsumerGroups/TopicConsumerGroupsContainer';
import SettingsContainer from './Settings/SettingsContainer';
import Messages from './Messages/Messages';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  isInternal: boolean;
  isDeleted: boolean;
  isDeletePolicy: boolean;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  clearTopicMessages(clusterName: ClusterName, topicName: TopicName): void;
}

const HeaderControlsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-self: center;
  gap: 26px;
`;

const Details: React.FC<Props> = ({
  clusterName,
  topicName,
  isInternal,
  isDeleted,
  isDeletePolicy,
  deleteTopic,
  clearTopicMessages,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const [isDeleteTopicConfirmationVisible, setDeleteTopicConfirmationVisible] =
    React.useState(false);
  const [isClearTopicConfirmationVisible, setClearTopicConfirmationVisible] =
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
    setClearTopicConfirmationVisible(false);
  }, [clusterName, topicName]);

  return (
    <div>
      <PageHeading text={topicName}>
        <HeaderControlsWrapper>
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
              Produce Message
            </Button>
          </Route>
          {!isReadOnly && !isInternal && (
            <Route path="/ui/clusters/:clusterName/topics/:topicName">
              <Dropdown label={<VerticalElipsisIcon />} right>
                <DropdownItem
                  onClick={() =>
                    history.push(clusterTopicEditPath(clusterName, topicName))
                  }
                >
                  Edit settings
                  <S.DropdownExtraMessage>
                    Pay attention! This operation has
                    <br />
                    especially important consequences.
                  </S.DropdownExtraMessage>
                </DropdownItem>
                {isDeletePolicy && (
                  <DropdownItem
                    onClick={() => setClearTopicConfirmationVisible(true)}
                    danger
                  >
                    Clear messages
                  </DropdownItem>
                )}
                {isTopicDeletionAllowed && (
                  <DropdownItem
                    onClick={() => setDeleteTopicConfirmationVisible(true)}
                    danger
                  >
                    Remove topic
                  </DropdownItem>
                )}
              </Dropdown>
            </Route>
          )}
        </HeaderControlsWrapper>
      </PageHeading>
      <ConfirmationModal
        isOpen={isDeleteTopicConfirmationVisible}
        onCancel={() => setDeleteTopicConfirmationVisible(false)}
        onConfirm={deleteTopicHandler}
      >
        Are you sure want to remove <b>{topicName}</b> topic?
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isClearTopicConfirmationVisible}
        onCancel={() => setClearTopicConfirmationVisible(false)}
        onConfirm={clearTopicMessagesHandler}
      >
        Are you sure want to clear topic messages?
      </ConfirmationModal>
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
          path="/ui/clusters/:clusterName/topics/:topicName/consumer-groups"
          component={TopicConsumerGroupsContainer}
        />
      </Switch>
    </div>
  );
};

export default Details;
