import React, { useCallback, useMemo, useState } from 'react';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { SeekDirection } from 'generated-sources';
import { useLocation } from 'react-router-dom';
import { boolean } from 'yup/lib/locale';
import camelCase from 'lodash/camelCase';

import FiltersContainer from './Filters/FiltersContainer';
import MessagesTable from './MessagesTable';

// export enum ISeekDirection {
//   FORWARD = 'FORWARD',
//   BACKWARD = 'BACKWARD',
//   TAILING = 'TAILING',

// }

interface ISeekDirection {
  [key: string]: {
    value: SeekDirection;
    label: string;
    isLive: boolean;
  };
}

export const SeekDirectionOptionsObj: ISeekDirection = {
  oldest: {
    value: SeekDirection.FORWARD,
    label: 'Oldest',
    isLive: false,
  },
  newest: {
    value: SeekDirection.BACKWARD,
    label: 'Newest',
    isLive: false,
  },
  liveMode: {
    value: SeekDirection.TAILING,
    label: 'Live Mode',
    isLive: true,
  },
  fromOffset: {
    value: SeekDirection.FORWARD,
    label: 'From offset',
    isLive: false,
  },
  toOffset: {
    value: SeekDirection.BACKWARD,
    label: 'To offset',
    isLive: false,
  },
  sinceTime: {
    value: SeekDirection.BACKWARD,
    label: 'Since time',
    isLive: false,
  },
  untilTime: {
    value: SeekDirection.FORWARD,
    label: 'Until time',
    isLive: false,
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

  const [currentOption, setCurrentOption] = React.useState<string>('');

  const [isLive, setIsLive] = useState<boolean>(
    SeekDirectionOptionsObj.untilTime.isLive
  );

  React.useEffect(() => {
    if (currentOption) {
      setIsLive(SeekDirectionOptionsObj[currentOption].isLive);
    }
  }, [currentOption]);

  const connectWord = (label: string) => camelCase(label);
  const changeCurrentOption = (label: string) => {
    setCurrentOption(connectWord(label));
  };

  const changeSeekDirection = useCallback((val: string) => {
    const connectVal = connectWord(val);

    if (connectVal) {
      setSeekDirection(SeekDirectionOptionsObj[connectVal].value);

      setIsLive(SeekDirectionOptionsObj[connectVal].isLive);
    }

    // switch (val) {
    //   case SeekDirection.FORWARD:
    //     setSeekDirection(SeekDirection.FORWARD);
    //     setIsLive(SeekDirectionOptionsObj.oldestFirst.isLive);
    //     break;
    //   case SeekDirection.BACKWARD:
    //     setSeekDirection(SeekDirection.BACKWARD);
    //     setIsLive(SeekDirectionOptionsObj.newestFirst.isLive);
    //     break;
    //   case SeekDirection.TAILING:
    //     setSeekDirection(SeekDirection.TAILING);
    //     setIsLive(SeekDirectionOptionsObj.liveMode.isLive);
    //     break;
    //   default:
    // }
  }, []);

  const contextValue = useMemo(
    () => ({
      seekDirection,
      searchParams,
      changeSeekDirection,
      isLive,
      changeCurrentOption,
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
