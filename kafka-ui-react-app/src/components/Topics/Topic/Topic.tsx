import React, { Suspense } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  RouteParamsClusterTopic,
  clusterTopicMessagesRelativePath,
  clusterTopicSettingsRelativePath,
  clusterTopicConsumerGroupsRelativePath,
  clusterTopicEditRelativePath,
  clusterTopicSendMessageRelativePath,
  clusterTopicStatisticsRelativePath,
  clusterTopicsPath,
  clusterTopicSendMessagePath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
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
import {
  clearTopicMessages,
  resetTopicMessages,
} from 'redux/reducers/topicMessages/topicMessagesSlice';
import { CleanUpPolicy } from 'generated-sources';
import PageLoader from 'components/common/PageLoader/PageLoader';

import Messages from './Messages/Messages';
import Overview from './Overview/Overview';
import Settings from './Settings/Settings';
import TopicConsumerGroups from './ConsumerGroups/TopicConsumerGroups';
import Statistics from './Statistics/Statistics';
import Edit from './Edit/Edit';
import SendMessage from './SendMessage/SendMessage';
import { FloatingSidebar } from './Topics.styled';

const Topic: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
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

  React.useEffect(() => {
    return () => {
      dispatch(resetTopicMessages());
    };
  }, []);

  const canCleanup = data?.cleanUpPolicy === CleanUpPolicy.DELETE;

  return (
    <>
      <PageHeading
        text={topicName}
        backText="Topics"
        backTo={clusterTopicsPath(clusterName)}
      >
        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={() => setIsVisible(true)}
          disabled={isReadOnly}
        >
          Produce Message
        </Button>
        <Dropdown disabled={isReadOnly || data?.internal}>
          <DropdownItem onClick={() => navigate(clusterTopicEditRelativePath)}>
            Edit settings
            <DropdownItemHint>
              Pay attention! This operation has
              <br />
              especially important consequences.
            </DropdownItemHint>
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              dispatch(clearTopicMessages({ clusterName, topicName })).unwrap()
            }
            confirm="Are you sure want to clear topic messages?"
            disabled={!canCleanup}
            danger
          >
            Clear messages
            <DropdownItemHint>
              Clearing messages is only allowed for topics
              <br />
              with DELETE policy
            </DropdownItemHint>
          </DropdownItem>

          <DropdownItem
            onClick={recreateTopic.mutateAsync}
            confirm={
              <>
                Are you sure want to recreate <b>{topicName}</b> topic?
              </>
            }
            danger
          >
            Recreate Topic
          </DropdownItem>
          <DropdownItem
            onClick={deleteTopicHandler}
            confirm={
              <>
                Are you sure want to remove <b>{topicName}</b> topic?
              </>
            }
            disabled={!isTopicDeletionAllowed}
            danger
          >
            Remove Topic
            {!isTopicDeletionAllowed && (
              <DropdownItemHint>
                The topic deletion is restricted at the application
                <br />
                configuration level
              </DropdownItemHint>
            )}
          </DropdownItem>
        </Dropdown>
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
        <NavLink
          to={clusterTopicStatisticsRelativePath}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Statistics
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
          <Route
            path={clusterTopicStatisticsRelativePath}
            element={<Statistics />}
          />
          <Route path={clusterTopicEditRelativePath} element={<Edit />} />
          <Route
            path={clusterTopicSendMessageRelativePath}
            element={<SendMessage />}
          />
        </Routes>
      </Suspense>
      <FloatingSidebar $visible={isVisible}>
        <SendMessage />
      </FloatingSidebar>
    </>
  );
};

export default Topic;
