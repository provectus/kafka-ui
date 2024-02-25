import React from 'react';
import { SeekDirection } from 'generated-sources';

export interface ContextProps {
  seekDirection: SeekDirection;
  changeSeekDirection(val: string): void;
  page: number;
  setPage(page: number): void;
  isLive: boolean;
}

const TopicMessagesContext = React.createContext<ContextProps>(
  {} as ContextProps
);

export default TopicMessagesContext;
