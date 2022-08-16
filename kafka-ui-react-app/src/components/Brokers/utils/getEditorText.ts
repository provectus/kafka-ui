import { BrokerMetrics } from 'generated-sources';

export const getEditorText = (metrics: BrokerMetrics | undefined): string =>
  metrics ? JSON.stringify(metrics) : 'Metrics data not available';
