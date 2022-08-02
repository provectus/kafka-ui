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
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import styled from 'styled-components';
import Navbar from 'components/common/Navigation/Navbar.styled';
import { useAppSelector } from 'lib/hooks/redux';
import {
  getIsTopicDeletePolicy,
  getIsTopicInternal,
} from 'redux/reducers/topics/selectors';
import useAppParams from 'lib/hooks/useAppParams';
import {
  Dropdown,
  DropdownItem,
  DropdownItemHint,
} from 'components/common/Dropdown';

import OverviewContainer from './Overview/OverviewContainer';
import TopicConsumerGroupsContainer from './ConsumerGroups/TopicConsumerGroupsContainer';
import SettingsContainer from './Settings/SettingsContainer';
import Messages from './Messages/Messages';

interface Props {
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

  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);

  const deleteTopicHandler = () => {
    deleteTopic({ clusterName, topicName });
    navigate('../..');
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
                  <Dropdown>
                    <DropdownItem
                      onClick={() => navigate(clusterTopicEditRelativePath)}
                    >
                      Edit settings
                      <DropdownItemHint>
                        Pay attention! This operation has
                        <br />
                        especially important consequences.
                      </DropdownItemHint>
                    </DropdownItem>
                    {isDeletePolicy && (
                      <DropdownItem
                        disabled={!isDeletePolicy}
                        onClick={() =>
                          clearTopicMessages({ clusterName, topicName })
                        }
                        confirm="Are you sure want to clear topic messages?"
                        danger
                      >
                        Clear messages
                      </DropdownItem>
                    )}
                    <DropdownItem
                      onClick={() => recreateTopic({ clusterName, topicName })}
                      confirm={
                        <>
                          Are you sure want to recreate <b>{topicName}</b>{' '}
                          topic?
                        </>
                      }
                      danger
                    >
                      Recreate Topic
                    </DropdownItem>
                    {isTopicDeletionAllowed && (
                      <DropdownItem
                        onClick={deleteTopicHandler}
                        confirm={
                          <>
                            Are you sure want to remove <b>{topicName}</b>{' '}
                            topic?
                          </>
                        }
                        danger
                      >
                        Remove Topic
                      </DropdownItem>
                    )}
                  </Dropdown>
                }
              />
            </Routes>
          )}
        </HeaderControlsWrapper>
      </PageHeading>
      <Navbar role="navigation">
        <NavLink
          to="."
          className={({ isActive }) => (isActive ? 'is-active' : '')}
          end
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
