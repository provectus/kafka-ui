// global-teardown.ts
import { FullConfig } from '@playwright/test';
import { delete_topics, topics } from '../steps/api';

async function globalTeardown(config: FullConfig) {
  let topics_list =  (await topics({clusterName:'local',showInternal:false})).topics.map(topic=>topic.name);
  // delete all the topics
   for await(const name of topics_list){
    await delete_topics({clusterName:'local',topicName:name})
   }
}

export default globalTeardown;