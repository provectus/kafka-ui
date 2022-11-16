import React, { useCallback, useMemo, useState } from 'react';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { SeekDirection, SerdeUsage } from 'generated-sources';
import { useSearchParams } from 'react-router-dom';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { getDefaultSerdeName } from 'components/Topics/Topic/Messages/getDefaultSerdeName';

import MessagesTable from './MessagesTable';
import FiltersContainer from './Filters/FiltersContainer';

export const SeekDirectionOptionsObj = {
  [SeekDirection.FORWARD]: {
    value: SeekDirection.FORWARD,
    label: 'Oldest First',
    isLive: false,
  },
  [SeekDirection.BACKWARD]: {
    value: SeekDirection.BACKWARD,
    label: 'Newest First',
    isLive: false,
  },
  [SeekDirection.TAILING]: {
    value: SeekDirection.TAILING,
    label: 'Live Mode',
    isLive: true,
  },
};

export const SeekDirectionOptions = Object.values(SeekDirectionOptionsObj);

const Messages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const { data: serdes = {} } = useSerdes({
    clusterName,
    topicName,
    use: SerdeUsage.DESERIALIZE,
  });

  React.useEffect(() => {
    if (!searchParams.get('keySerde')) {
      searchParams.set('keySerde', getDefaultSerdeName(serdes.key || []));
    }
    if (!searchParams.get('valueSerde')) {
      searchParams.set('valueSerde', getDefaultSerdeName(serdes.value || []));
    }
    setSearchParams(searchParams);
  }, [serdes]);

  const defaultSeekValue = SeekDirectionOptions[0];

  const [seekDirection, setSeekDirection] = React.useState<SeekDirection>(
    (searchParams.get('seekDirection') as SeekDirection) ||
      defaultSeekValue.value
  );

  const [isLive, setIsLive] = useState<boolean>(
    SeekDirectionOptionsObj[seekDirection].isLive
  );

  const changeSeekDirection = useCallback((val: string) => {
    switch (val) {
      case SeekDirection.FORWARD:
        setSeekDirection(SeekDirection.FORWARD);
        setIsLive(SeekDirectionOptionsObj[SeekDirection.FORWARD].isLive);
        break;
      case SeekDirection.BACKWARD:
        setSeekDirection(SeekDirection.BACKWARD);
        setIsLive(SeekDirectionOptionsObj[SeekDirection.BACKWARD].isLive);
        break;
      case SeekDirection.TAILING:
        setSeekDirection(SeekDirection.TAILING);
        setIsLive(SeekDirectionOptionsObj[SeekDirection.TAILING].isLive);
        break;
      default:
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      seekDirection,
      changeSeekDirection,
      isLive,
    }),
    [seekDirection, changeSeekDirection]
  );

  return (
    <TopicMessagesContext.Provider value={contextValue}>
      <FiltersContainer />
      <MessagesTable />
    </TopicMessagesContext.Provider>
  );
};

export default Messages;
