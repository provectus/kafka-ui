import React, { useCallback, useMemo, useState } from 'react';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { SeekDirection } from 'generated-sources';
import { useSearchParams } from 'react-router-dom';

import MessagesTable from './MessagesTable';
import FiltersContainer from './Filters/FiltersContainer';

export const SeekDirectionOptionsObj = {
  [SeekDirection.BACKWARD]: {
    value: SeekDirection.BACKWARD,
    label: 'Newest First',
    isLive: false,
  },
  [SeekDirection.FORWARD]: {
    value: SeekDirection.FORWARD,
    label: 'Oldest First',
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
  const [searchParams] = useSearchParams();

  const defaultSeekValue = SeekDirectionOptions[0];

  const [seekDirection, setSeekDirection] = React.useState<SeekDirection>(
    (searchParams.get('seekDirection') as SeekDirection) ||
      defaultSeekValue.value
  );

  const [isLive, setIsLive] = useState<boolean>(
    SeekDirectionOptionsObj[seekDirection].isLive
  );

  const [page, setPage] = React.useState<number>(1);

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
      page,
      setPage,
      isLive,
    }),
    [seekDirection, changeSeekDirection, page, setPage]
  );

  return (
    <TopicMessagesContext.Provider value={contextValue}>
      <FiltersContainer />
      <MessagesTable />
    </TopicMessagesContext.Provider>
  );
};

export default Messages;
