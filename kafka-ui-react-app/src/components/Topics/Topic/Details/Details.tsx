import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  RouteParamsClusterTopic,
  clusterTopicMessagesRelativePath,
  clusterTopicSettingsRelativePath,
  clusterTopicConsumerGroupsRelativePath,
  clusterTopicEditRelativePath,
  clusterTopicSendMessageRelativePath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useDispatch } from 'react-redux';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import Dropdown from 'components/common/Dropdown/Dropdown';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import styled from 'styled-components';
import Navbar from 'components/common/Navigation/Navbar.styled';
import * as S from 'components/Topics/Topic/Details/Details.styled';
import { useAppSelector } from 'lib/hooks/redux';
import {
  getIsTopicDeletePolicy,
  getIsTopicInternal,
} from 'redux/reducers/topics/selectors';
import useAppParams from 'lib/hooks/useAppParams';

import OverviewContainer from './Overview/OverviewContainer';
import TopicConsumerGroupsContainer from './ConsumerGroups/TopicConsumerGroupsContainer';
import SettingsContainer from './Settings/SettingsContainer';
import Messages from './Messages/Messages';

interface Props {
  isDeleted: boolean;
  deleteTopic: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
  recreateTopic: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
  clearTopicMessages(params: {
    clusterName: ClusterName;
    topicName: TopicName;
  }): void;
}

const HeaderControlsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-self: center;
  gap: 26px;
`;

const Details: React.FC<Props> = ({
  isDeleted,
  deleteTopic,
  recreateTopic,
  clearTopicMessages,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const isInternal = useAppSelector((state) =>
    getIsTopicInternal(state, topicName)
  );

  const isDeletePolicy = useAppSelector((state) =>
    getIsTopicDeletePolicy(state, topicName)
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const [isDeleteTopicConfirmationVisible, setDeleteTopicConfirmationVisible] =
    React.useState(false);
  const [isClearTopicConfirmationVisible, setClearTopicConfirmationVisible] =
    React.useState(false);
  const [
    isRecreateTopicConfirmationVisible,
    setRecreateTopicConfirmationVisible,
  ] = React.useState(false);
  const deleteTopicHandler = () => deleteTopic({ clusterName, topicName });

  React.useEffect(() => {
    if (isDeleted) {
      navigate('../..');
    }
  }, [isDeleted, clusterName, dispatch, navigate]);

  const clearTopicMessagesHandler = () => {
    clearTopicMessages({ clusterName, topicName });
    setClearTopicConfirmationVisible(false);
  };

  const recreateTopicHandler = () => {
    recreateTopic({ clusterName, topicName });
    setRecreateTopicConfirmationVisible(false);
  };

  return (
    <div>
      <PageHeading text={topicName}>
        <HeaderControlsWrapper>
          <Routes>
            <Route
              path={clusterTopicMessagesRelativePath}
              element={
                <Button
                  buttonSize="M"
                  buttonType="primary"
                  to={`../${clusterTopicSendMessageRelativePath}`}
                  disabled={isReadOnly}
                >
                  Produce Message
                </Button>
              }
            />
          </Routes>
          {!isReadOnly && !isInternal && (
            <Routes>
              <Route
                index
                element={
                  <Dropdown label={<VerticalElipsisIcon />} right>
                    <DropdownItem
                      onClick={() => navigate(clusterTopicEditRelativePath)}
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
                    <DropdownItem
                      onClick={() => setRecreateTopicConfirmationVisible(true)}
                      danger
                    >
                      Recreate Topic
                    </DropdownItem>
                    {isTopicDeletionAllowed && (
                      <DropdownItem
                        onClick={() => setDeleteTopicConfirmationVisible(true)}
                        danger
                      >
                        Remove topic
                      </DropdownItem>
                    )}
                  </Dropdown>
                }
              />
            </Routes>
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
      <ConfirmationModal
        isOpen={isRecreateTopicConfirmationVisible}
        onCancel={() => setRecreateTopicConfirmationVisible(false)}
        onConfirm={recreateTopicHandler}
      >
        Are you sure want to recreate <b>{topicName}</b> topic?
      </ConfirmationModal>
      <Navbar role="navigation">
        <NavLink
          to="."
          className={({ isActive }) => (isActive ? 'is-active is-primary' : '')}
        >
          Overview
        </NavLink>
        <NavLink
          to={clusterTopicMessagesRelativePath}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Messages
        </NavLink>
        <NavLink
          to={clusterTopicConsumerGroupsRelativePath}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Consumers
        </NavLink>
        <NavLink
          to={clusterTopicSettingsRelativePath}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Settings
        </NavLink>
      </Navbar>
      <Routes>
        <Route index element={<OverviewContainer />} />

        <Route path={clusterTopicMessagesRelativePath} element={<Messages />} />

        <Route
          path={clusterTopicSettingsRelativePath}
          element={<SettingsContainer />}
        />

        <Route
          path={clusterTopicConsumerGroupsRelativePath}
          element={<TopicConsumerGroupsContainer />}
        />
      </Routes>
    </div>
  );
};

export default Details;
