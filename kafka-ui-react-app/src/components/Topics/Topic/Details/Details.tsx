import React, { Suspense } from 'react';
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
import { useAppDispatch } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import {
  Dropdown,
  DropdownItem,
  DropdownItemHint,
} from 'components/common/Dropdown';
import {
  useDeleteTopic,
  useRecreateTopic,
  useTopicDetails,
} from 'lib/hooks/api/topics';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { CleanUpPolicy } from 'generated-sources';
import PageLoader from 'components/common/PageLoader/PageLoader';

import Messages from './Messages/Messages';
import Overview from './Overview/Overview';
import Settings from './Settings/Settings';
import TopicConsumerGroups from './ConsumerGroups/TopicConsumerGroups';

const HeaderControlsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-self: center;
  gap: 26px;
`;

const Details: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const navigate = useNavigate();
  const deleteTopic = useDeleteTopic(clusterName);
  const recreateTopic = useRecreateTopic({ clusterName, topicName });
  const { data } = useTopicDetails({ clusterName, topicName });

  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);

  const deleteTopicHandler = async () => {
    await deleteTopic.mutateAsync(topicName);
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
          {!isReadOnly && !data?.internal && (
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
                    {data?.cleanUpPolicy === CleanUpPolicy.DELETE && (
                      <DropdownItem
                        onClick={() =>
                          dispatch(
                            clearTopicMessages({ clusterName, topicName })
                          ).unwrap()
                        }
                        confirm="Are you sure want to clear topic messages?"
                        danger
                      >
                        Clear messages
                      </DropdownItem>
                    )}
                    <DropdownItem
                      onClick={recreateTopic.mutateAsync}
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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<Overview />} />
          <Route
            path={clusterTopicMessagesRelativePath}
            element={<Messages />}
          />
          <Route
            path={clusterTopicSettingsRelativePath}
            element={<Settings />}
          />
          <Route
            path={clusterTopicConsumerGroupsRelativePath}
            element={<TopicConsumerGroups />}
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Details;
