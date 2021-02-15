import { TopicMessage } from 'generated-sources';

export const messages: TopicMessage[] = [
  {
    partition: 1,
    offset: 2,
    timestamp: new Date('05-05-1995'),
    content: {
      foo: 'bar',
      key: 'val',
    },
  },
  {
    partition: 2,
    offset: 20,
    timestamp: new Date('05-07-2020'),
    content: undefined,
  },
];
