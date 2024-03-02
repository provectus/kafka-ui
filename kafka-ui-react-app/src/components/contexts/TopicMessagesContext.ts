import React from 'react';
import { PollingMode, TopicSerdeSuggestion } from 'generated-sources';

export interface ContextProps {
  pollingMode: PollingMode;
  changePollingMode(val: string): void;
  page: number;
  setPage(page: number): void;
  isLive: boolean;
  keySerde: string;
  setKeySerde(val: string): void;
  valueSerde: string;
  setValueSerde(val: string): void;
  serdes: TopicSerdeSuggestion;
}

const TopicMessagesContext = React.createContext<ContextProps>(
  {} as ContextProps
);

export default TopicMessagesContext;
