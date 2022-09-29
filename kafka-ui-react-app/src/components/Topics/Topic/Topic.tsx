import React, { Suspense } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  RouteParamsClusterTopic,
  clusterTopicMessagesRelativePath,
  clusterTopicSettingsRelativePath,
  clusterTopicConsumerGroupsRelativePath,
  clusterTopicEditRelativePath,
  clusterTopicStatisticsRelativePath,
  clusterTopicsPath,
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
import SlidingSidebar from 'components/common/SlidingSidebar';
import useBoolean from 'lib/hooks/useBoolean';
import * as Metrics from 'components/common/Metrics';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { Tag } from 'components/common/Tag/Tag.styled';

import Messages from './Messages/Messages';
import MessagesV2 from './MessagesV2/Messages';
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

  const messageCount = React.useMemo(
    () =>
      (data?.partitions || []).reduce((memo, partition) => {
        return memo + partition.offsetMax - partition.offsetMin;
      }, 0),
    [data]
  );

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
          onClick={openSidebar}
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

      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Partitions">
            {data?.partitionCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Replication Factor">
            {data?.replicationFactor}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="URP"
            title="Under replicated partitions"
            isAlert
            alertType={
              data?.underReplicatedPartitions === 0 ? 'success' : 'error'
            }
          >
            {data?.underReplicatedPartitions === 0 ? (
              <Metrics.LightText>
                {data?.underReplicatedPartitions}
              </Metrics.LightText>
            ) : (
              <Metrics.RedText>
                {data?.underReplicatedPartitions}
              </Metrics.RedText>
            )}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="In Sync Replicas"
            isAlert
            alertType={
              data?.inSyncReplicas === data?.replicas ? 'success' : 'error'
            }
          >
            {data?.inSyncReplicas &&
            data?.replicas &&
            data?.inSyncReplicas < data?.replicas ? (
              <Metrics.RedText>{data?.inSyncReplicas}</Metrics.RedText>
            ) : (
              data?.inSyncReplicas
            )}
            <Metrics.LightText> of {data?.replicas}</Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label="Type">
            <Tag color="gray">{data?.internal ? 'Internal' : 'External'}</Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Size" title="">
            <BytesFormatted value={data?.segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {data?.segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Clean Up Policy">
            <Tag color="gray">{data?.cleanUpPolicy || 'Unknown'}</Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Message Count">
            {messageCount}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>

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
          <Route path="v2" element={<MessagesV2 />} />
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
        <SendMessage onSubmit={closeSidebar} />
      </SlidingSidebar>
    </>
  );
};

export default Topic;
