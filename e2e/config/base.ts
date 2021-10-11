import { Page, test as base } from "@playwright/test";
import { Brokers } from "../pages/brokers";
import { Dashboard } from "../pages/dashboard";
import { NewTopic } from "../pages/new-topic";
import { Topics } from "../pages/topics";
import * as api from "../steps/api";
import * as steps from "../steps/steps";

type Fixture = {
  dashboard: Dashboard;
  brokers: (cluster: string) => Brokers;
  topics: (cluster: string) => Topics;
  new_topic: (cluster: string) => NewTopic;
  api: typeof api;
  steps: typeof steps;
};

export const test = base.extend<Fixture>({
  dashboard: async ({ baseURL, page }, use) => {
    await use(new Dashboard(baseURL, page));
  },
  brokers: async ({ baseURL, page }, use) => {
    await use((cluster) => new Brokers(baseURL, page, cluster));
  },
  topics: async ({ baseURL, page }, use) => {
    await use((cluster) => new Topics(baseURL, page, cluster));
  },
  new_topic: async ({ baseURL, page }, use) => {
    await use((cluster) => new NewTopic(baseURL, page, cluster));
  },
  api,
  steps
});
