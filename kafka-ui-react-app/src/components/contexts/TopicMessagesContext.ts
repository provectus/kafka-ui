import React from 'react';
import { SeekDirection } from 'generated-sources';

export interface ContextProps {
  seekDirection: SeekDirection;
  searchParams: URLSearchParams;
  changeSeekDirection(val: string): void;
  isLive: boolean;
  keySerde: string;
  valueSerde: string;
}

const TopicMessagesContext = React.createContext<ContextProps>(
  {} as ContextProps
);

export default TopicMessagesContext;
