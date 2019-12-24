import {
  TopicName,
  Topic,
  Broker,
} from 'types';

const BASE_PARAMS: RequestInit = {
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.kafka.v2+json',
  },
};

const BASE_URL = 'http://localhost:8082';

export const getTopic = (name: TopicName): Promise<Topic> =>
  fetch(`${BASE_URL}/topics/${name}`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopics = (): Promise<TopicName[]> =>
  fetch(`${BASE_URL}/topics`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getBrokers = (): Promise<{ brokers: Broker[] }> =>
  fetch(`${BASE_URL}/brokers`, { ...BASE_PARAMS })
    .then(res => res.json());
