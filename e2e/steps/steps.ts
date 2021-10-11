import * as api from './api';
import { v4 as uuid } from "uuid";
const partitions = 1;
const replicationFactor = 1;

export const create_topic = async (name="new-topic-" + uuid())=>{
    const configs = {
      "cleanup.policy": "delete",
      "retention.ms": "604800000",
      "retention.bytes": "-1",
      "max.message.bytes": "1000012",
      "min.insync.replicas": "1",
    };
    await api.create_topic({
      clusterName: "local",
      topicCreation: { name, partitions, replicationFactor, configs },
    });
    return name;
}