import { TopicMessage } from 'generated-sources';

export const messages: TopicMessage[] = [
  {
    partition: 1,
    offset: 2,
    timestamp: new Date(Date.UTC(1995, 5, 5)),
    content: {
      foo: 'bar',
      key: 'val',
    },
  },
  {
    partition: 2,
    offset: 20,
    timestamp: new Date(Date.UTC(2020, 7, 5)),
    content: undefined,
  },
];
