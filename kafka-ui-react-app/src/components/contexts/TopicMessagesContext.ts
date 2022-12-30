import React from 'react';
import { SeekDirection } from 'generated-sources';

export interface ContextProps {
  seekDirection: SeekDirection;
  changeSeekDirection(val: string): void;
  isLive: boolean;
  page: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  paginated: boolean;
}

const TopicMessagesContext = React.createContext<ContextProps>(
  {} as ContextProps
);

export default TopicMessagesContext;
