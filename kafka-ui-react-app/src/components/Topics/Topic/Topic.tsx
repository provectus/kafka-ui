import React, { Suspense } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  clusterTopicConsumerGroupsRelativePath,
  clusterTopicEditRelativePath,
  clusterTopicMessagesRelativePath,
  clusterTopicSettingsRelativePath,
  clusterTopicsPath,
  clusterTopicStatisticsRelativePath,
  RouteParamsClusterTopic,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import PageHeading from 'components/common/PageHeading/PageHeading';
import ActionButton from 'components/common/ActionButton/ActionButton';
import Navbar from 'components/common/Navigation/Navbar.styled';
import { useAppDispatch } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import { Dropdown, DropdownItemHint } from 'components/common/Dropdown';
import {
  useDeleteTopic,
  useRecreateTopic,
  useTopicDetails,
} from 'lib/hooks/api/topics';
import {
  clearTopicMessages,
  resetTopicMessages,
} from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  Action,
  CleanUpPolicy,
  UserPermissionResourceEnum,
} from 'generated-sources';
import ActionDropdownItem from 'components/common/Dropdown/ActionDropdownItem';
import PageLoader from 'components/common/PageLoader/PageLoader';
import SlidingSidebar from 'components/common/SlidingSidebar';
import useBoolean from 'lib/hooks/useBoolean';
import { usePermission } from 'lib/hooks/usePermission';
import ActionNavLink from 'components/common/ActionNavLink/ActionNavLink';

import Messages from './Messages/Messages';
import Overview from './Overview/Overview';
import Settings from './Settings/Settings';
import TopicConsumerGroups from './ConsumerGroups/TopicConsumerGroups';
import Statistics from './Statistics/Statistics';
import Edit from './Edit/Edit';
import SendMessage from './SendMessage/SendMessage';

const Topic: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    value: isSidebarOpen,
    setFalse: closeSidebar,
    setTrue: openSidebar,
  } = useBoolean(false);
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const canProduceTopicMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.MESSAGES_PRODUCE,
    topicName
  );

  const canEditMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.EDIT,
    topicName
  );

  const canViewMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.MESSAGES_READ,
    topicName
  );

  const canCreateMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.CREATE,
    topicName
  );

  const canRemoveMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.DELETE,
    topicName
  );

  const canClearMessage = usePermission(
    UserPermissionResourceEnum.TOPIC,
    Action.MESSAGES_DELETE,
    topicName
  );

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
        <ActionButton
          buttonSize="M"
          buttonType="primary"
          onClick={openSidebar}
          disabled={isReadOnly}
          canDoAction={canProduceTopicMessage}
        >
          Produce Message
        </ActionButton>
        <Dropdown disabled={isReadOnly || data?.internal}>
          <ActionDropdownItem
            onClick={() => navigate(clusterTopicEditRelativePath)}
            canDoAction={canEditMessage}
          >
            Edit settings
            <DropdownItemHint>
              Pay attention! This operation has
              <br />
              especially important consequences.
            </DropdownItemHint>
          </ActionDropdownItem>

          <ActionDropdownItem
            onClick={() =>
              dispatch(clearTopicMessages({ clusterName, topicName })).unwrap()
            }
            confirm="Are you sure want to clear topic messages?"
            disabled={!canCleanup}
            canDoAction={canClearMessage}
            danger
          >
            Clear messages
            <DropdownItemHint>
              Clearing messages is only allowed for topics
              <br />
              with DELETE policy
            </DropdownItemHint>
          </ActionDropdownItem>

          <ActionDropdownItem
            onClick={recreateTopic.mutateAsync}
            confirm={
              <>
                Are you sure want to recreate <b>{topicName}</b> topic?
              </>
            }
            danger
            canDoAction={canViewMessage && canCreateMessage && canRemoveMessage}
          >
            Recreate Topic
          </ActionDropdownItem>
          <ActionDropdownItem
            onClick={deleteTopicHandler}
            confirm={
              <>
                Are you sure want to remove <b>{topicName}</b> topic?
              </>
            }
            disabled={!isTopicDeletionAllowed}
            danger
            canDoAction={canRemoveMessage}
          >
            Remove Topic
            {!isTopicDeletionAllowed && (
              <DropdownItemHint>
                The topic deletion is restricted at the application
                <br />
                configuration level
              </DropdownItemHint>
            )}
          </ActionDropdownItem>
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
        <ActionNavLink
          to={clusterTopicMessagesRelativePath}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
          canDoAction={canViewMessage}
        >
          Messages
        </ActionNavLink>
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
        </Routes>
      </Suspense>
      <SlidingSidebar
        open={isSidebarOpen}
        onClose={closeSidebar}
        title="Produce Message"
      >
        <Suspense fallback={<PageLoader />}>
          <SendMessage onSubmit={closeSidebar} />
        </Suspense>
      </SlidingSidebar>
    </>
  );
};

export default Topic;
