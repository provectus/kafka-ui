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

export const messageContent = `{
  "_id": "609fab8aed527f514f4e648d",
  "name": "in nostrud",
  "desc": "Dolore nostrud commodo magna velit ut magna voluptate sint aute. Excepteur aute culpa culpa dolor ipsum. Tempor est ut officia tempor laborum consectetur.\r\nAmet officia eu veniam Lorem enim aliqua aute voluptate elit do sunt in magna occaecat. Nisi sit non est adipisicing adipisicing consequat duis duis tempor consequat deserunt ea quis ad. Veniam sunt culpa nostrud adipisicing cillum voluptate non est cupidatat. Eiusmod tempor officia irure et deserunt est ex laboris occaecat adipisicing occaecat in aliquip aliqua. Do laboris culpa cupidatat cillum non. Ullamco excepteur mollit voluptate anim in nisi anim elit culpa aute. Ad officia sunt proident ut ullamco officia ea fugiat culpa cillum et fugiat aliquip.\r\nAmet non labore anim in ipsum. Et Lorem velit dolor ipsum. Irure id proident excepteur aliquip deserunt id officia dolor deserunt amet in sint. Aute in nostrud nulla ut laboris Lorem commodo nulla ipsum. Aliqua nulla commodo Lorem labore magna esse proident id ea in pariatur consectetur sint Lorem.\r\nCupidatat deserunt mollit tempor aliqua. Fugiat ullamco magna pariatur quis nulla magna. Esse duis labore ipsum nisi ullamco qui aute duis duis amet est laborum adipisicing magna. Est aliquip quis qui do aliquip nisi elit tempor ex aliquip. Excepteur aliquip ea deserunt amet adipisicing voluptate eiusmod sit sint exercitation exercitation. Id labore amet mollit ex commodo. Proident ex adipisicing deserunt esse Lorem tempor laborum nostrud commodo incididunt ea id.\r\n",
  "semster": "spring19",
  "profile": "cs",
  "degree": "bachelor",
  "degreee": "master",
  "degreeeee": "bachelor"
}`;
