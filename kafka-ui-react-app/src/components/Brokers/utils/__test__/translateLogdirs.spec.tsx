import {
  translateLogdir,
  translateLogdirs,
} from 'components/Brokers/utils/translateLogdirs';
import { brokerLogDirsPayload } from 'components/Brokers/__test__/fixtures';

import {
  defaultTransformedBrokerLogDirsPayload,
  transformedBrokerLogDirsPayload,
} from './fixtures';

describe('translateLogdir and translateLogdirs', () => {
  describe('translateLogdirs', () => {
    it('returns empty array when broker logdirs is not defined', () => {
      expect(translateLogdirs(undefined)).toEqual([]);
    });
    it('returns transformed LogDirs array when broker logdirs defined', () => {
      expect(translateLogdirs(brokerLogDirsPayload)).toEqual(
        transformedBrokerLogDirsPayload
      );
    });
  });
  describe('translateLogdir', () => {
    it('returns default data when broker logdir is empty', () => {
      expect(translateLogdir({})).toEqual(
        defaultTransformedBrokerLogDirsPayload
      );
    });
    it('returns transformed LogDir when broker logdir defined', () => {
      expect(translateLogdir(brokerLogDirsPayload[0])).toEqual(
        transformedBrokerLogDirsPayload[0]
      );
    });
  });
});
