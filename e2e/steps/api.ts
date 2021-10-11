import config from '../config/playwright.config';
import { Configuration, ConfigurationParameters, GetTopicsRequest, DeleteTopicRequest, TopicsApi, TopicsResponse, CreateTopicRequest } from '../src/generated-sources'
import fetch from 'node-fetch';

const baseURL = config.use.baseURL.substr(0,config.use.baseURL.length-1);// removing last '/'

const BASE_PARAMS: ConfigurationParameters = {
    basePath: baseURL,
    credentials: 'include',
    fetchApi: fetch,
    headers: {
      'Content-Type': 'application/json',
    },
};

const apiClientConf = new Configuration(BASE_PARAMS);
const topicsApiClient = new TopicsApi(apiClientConf);

export const topics = async (params: GetTopicsRequest):Promise<TopicsResponse> => (await topicsApiClient.getTopics(params))
export const delete_topics = async (params: DeleteTopicRequest):Promise<void> => await topicsApiClient.deleteTopic(params)
export const create_topic = async (params: CreateTopicRequest): Promise<void>=>{
  await topicsApiClient.createTopic(params)
}