import React, { useCallback, useMemo, useState } from 'react';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { PollingMode, SerdeUsage } from 'generated-sources';
import { useSearchParams } from 'react-router-dom';
import { PollingModeOptions, PollingModeOptionsObj } from 'lib/constants';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';

import FiltersContainer from './Filters/FiltersContainer';
import MessagesTable from './MessagesTable';
import { getDefaultSerdeName } from './Filters/getDefaultSerdeName';

const Messages: React.FC = () => {
  const [searchParams] = useSearchParams();

  const defaultPollingModeValue = PollingModeOptions[0];

  const [pollingMode, setPollingMode] = React.useState<PollingMode>(
    (searchParams.get('pollingMode') as PollingMode) ||
      defaultPollingModeValue.value
  );

  const [isLive, setIsLive] = useState<boolean>(
    PollingModeOptionsObj[pollingMode].isLive
  );

  const [page, setPage] = React.useState<number>(1);

  const changePollingMode = useCallback((val: PollingMode) => {
    setPollingMode(val);
    setIsLive(PollingModeOptionsObj[val].isLive);
  }, []);

  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const { data: serdes = {} } = useSerdes({
    clusterName,
    topicName,
    use: SerdeUsage.DESERIALIZE,
  });

  const [keySerde, setKeySerde] = React.useState<string>(
    searchParams.get('keySerde') || getDefaultSerdeName(serdes.key || [])
  );
  const [valueSerde, setValueSerde] = React.useState<string>(
    searchParams.get('valueSerde') || getDefaultSerdeName(serdes.value || [])
  );

  const contextValue = useMemo(
    () => ({
      pollingMode,
      changePollingMode,
      page,
      setPage,
      isLive,
      keySerde,
      setKeySerde,
      valueSerde,
      setValueSerde,
      serdes,
    }),
    [
      pollingMode,
      changePollingMode,
      page,
      setPage,
      serdes,
      keySerde,
      setKeySerde,
      valueSerde,
      setValueSerde,
    ]
  );

  return (
    <TopicMessagesContext.Provider value={contextValue}>
      <FiltersContainer />
      <MessagesTable />
    </TopicMessagesContext.Provider>
  );
};

export default Messages;
