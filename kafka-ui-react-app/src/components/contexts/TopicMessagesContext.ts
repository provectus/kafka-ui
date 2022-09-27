import React from 'react';
import { SeekDirection } from 'generated-sources';

export interface ContextProps {
  seekDirection: SeekDirection;
  changeSeekDirection(val: string): void;
  isLive: boolean;
}

const TopicMessagesContext = React.createContext<ContextProps>(
  {} as ContextProps
);

export default TopicMessagesContext;
