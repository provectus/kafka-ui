import topicParamsTransformer, {
  getValue,
} from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';

import { transformedParams, customConfigs, topicWithInfo } from './fixtures';

describe('topicParamsTransformer', () => {
  const testField = (name: keyof typeof DEFAULTS, fieldName: string) => {
    it('return completed values', () => {
      expect(topicParamsTransformer(topicWithInfo)[name]).toEqual(
        transformedParams[name]
      );
    });
    it(`return default values when ${name} not defined`, () => {
      expect(
        topicParamsTransformer({
          ...topicWithInfo,
          config: topicWithInfo.config?.filter(
            (config) => config.name !== fieldName
          ),
        })[name]
      ).toEqual(DEFAULTS[name]);
    });

    it('typeof return values is number', () => {
      expect(
        typeof topicParamsTransformer(topicWithInfo).retentionBytes
      ).toEqual('number');
    });
  };

  describe('getValue', () => {
    it('return value when find field name', () => {
      expect(
        getValue(topicWithInfo, 'confluent.tier.segment.hotset.roll.min.bytes')
      ).toEqual(104857600);
    });
    it('return value when not defined field name', () => {
      expect(getValue(topicWithInfo, 'some.unsupported.fieldName')).toEqual(-1);
    });
    it('return value when not defined field name and has a default value', () => {
      expect(
        getValue(topicWithInfo, 'some.unsupported.fieldName', 100)
      ).toEqual(100);
    });
  });
  describe('Topic', () => {
    it('return default values when topic not defined found', () => {
      expect(topicParamsTransformer(undefined)).toEqual(DEFAULTS);
    });

    it('return completed values', () => {
      expect(topicParamsTransformer(topicWithInfo)).toEqual(transformedParams);
    });
  });

  describe('Topic partitions', () => {
    it('return completed values', () => {
      expect(topicParamsTransformer(topicWithInfo).partitions).toEqual(
        transformedParams.partitions
      );
    });
    it('return default values when partitionCount not defined', () => {
      expect(
        topicParamsTransformer({ ...topicWithInfo, partitionCount: undefined })
          .partitions
      ).toEqual(DEFAULTS.partitions);
    });
  });

  describe('maxMessageBytes', () =>
    testField('maxMessageBytes', 'max.message.bytes'));

  describe('minInsyncReplicas', () =>
    testField('minInsyncReplicas', 'min.insync.replicas'));

  describe('retentionBytes', () =>
    testField('retentionBytes', 'retention.bytes'));

  describe('retentionMs', () => testField('retentionMs', 'retention.ms'));

  describe(`customParams`, () => {
    it('return value when configs is empty', () => {
      expect(
        topicParamsTransformer({ ...topicWithInfo, config: [] }).customParams
      ).toEqual([]);
    });

    it('return value when had a 2 custom configs', () => {
      expect(
        topicParamsTransformer({
          ...topicWithInfo,
          config: customConfigs,
        }).customParams?.length
      ).toEqual(2);
    });
  });
});
