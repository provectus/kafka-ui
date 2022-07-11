import { getEditorText } from 'components/Brokers/utils/getEditorText';

import {
  brokerMetricsPayload,
  transformedBrokerMetricsPayload,
} from './fixtures';

describe('Get editor text', () => {
  it('returns error message when broker metrics is not defined', () => {
    expect(getEditorText(undefined)).toEqual('Metrics data not available');
  });
  it('returns transformed metrics text when broker logdirs metrics', () => {
    expect(getEditorText(brokerMetricsPayload)).toEqual(
      transformedBrokerMetricsPayload
    );
  });
});
