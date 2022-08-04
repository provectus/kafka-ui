import topicParamsTransformer, {
  getValue,
} from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';

import { transformedParams, customConfigs, topicWithInfo } from './fixtures';

describe('topicParamsTransformer', () => {
  const testField = (name: keyof typeof DEFAULTS, fieldName: string) => {
    it('returns transformed value', () => {
      expect(topicParamsTransformer(topicWithInfo)[name]).toEqual(
        transformedParams[name]
      );
    });
    it(`returns default value when ${name} not defined`, () => {
      expect(
        topicParamsTransformer({
          ...topicWithInfo,
          config: topicWithInfo.config?.filter(
            (config) => config.name !== fieldName
          ),
        })[name]
      ).toEqual(DEFAULTS[name]);
    });

    it('returns number value', () => {
      expect(
        typeof topicParamsTransformer(topicWithInfo).retentionBytes
      ).toEqual('number');
    });
  };

  describe('getValue', () => {
    it('returns value when field exists', () => {
      expect(
        getValue(topicWithInfo, 'confluent.tier.segment.hotset.roll.min.bytes')
      ).toEqual(104857600);
    });
    it('returns undefined when filed name does not exist', () => {
      expect(getValue(topicWithInfo, 'some.unsupported.fieldName')).toEqual(
        undefined
      );
    });
    it('returns default value when field does not exist', () => {
      expect(
        getValue(topicWithInfo, 'some.unsupported.fieldName', 100)
      ).toEqual(100);
    });
  });
  describe('Topic', () => {
    it('returns default values when topic not defined found', () => {
      expect(topicParamsTransformer(undefined)).toEqual(DEFAULTS);
    });

    it('returns transformed values', () => {
      expect(topicParamsTransformer(topicWithInfo)).toEqual(transformedParams);
    });
  });

  describe('Topic partitions', () => {
    it('returns transformed value', () => {
      expect(topicParamsTransformer(topicWithInfo).partitions).toEqual(
        transformedParams.partitions
      );
    });
    it('returns default value when partitionCount not defined', () => {
      expect(
        topicParamsTransformer({ ...topicWithInfo, partitionCount: undefined })
          .partitions
      ).toEqual(DEFAULTS.partitions);
    });
  });

  describe('maxMessageBytes', () =>
    testField('maxMessageBytes', 'max.message.bytes'));

  describe('minInSyncReplicas', () =>
    testField('minInSyncReplicas', 'min.insync.replicas'));

  describe('retentionBytes', () =>
    testField('retentionBytes', 'retention.bytes'));

  describe('retentionMs', () => testField('retentionMs', 'retention.ms'));

  describe('customParams', () => {
    it('returns value when configs is empty', () => {
      expect(
        topicParamsTransformer({ ...topicWithInfo, config: [] }).customParams
      ).toEqual([]);
    });

    it('returns value when had a 2 custom configs', () => {
      expect(
        topicParamsTransformer({
          ...topicWithInfo,
          config: customConfigs,
        }).customParams?.length
      ).toEqual(2);
    });
  });
});
