import React, { useCallback, useMemo, useState } from 'react';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { SeekDirection } from 'generated-sources';
import { useLocation } from 'react-router-dom';

import FiltersContainer from './Filters/FiltersContainer';
import MessagesTable from './MessagesTable';

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
  const location = useLocation();

  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

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
      searchParams,
      changeSeekDirection,
      isLive,
    }),
    [seekDirection, searchParams, changeSeekDirection]
  );

  return (
    <TopicMessagesContext.Provider value={contextValue}>
      <FiltersContainer />
      <MessagesTable />
    </TopicMessagesContext.Provider>
  );
};

export default Messages;
