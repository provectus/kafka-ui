import topicParamsTransformer, {
  getValue,
} from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';
import { TOPIC_CUSTOM_PARAMS_PREFIX } from 'lib/constants';
import { ConfigSource } from 'generated-sources';

import { completedParams, topicWithInfo } from './fixtures';

describe('topicParamsTransformer', () => {
  const testField = (name: keyof typeof DEFAULTS, fieldName: string) => {
    it('return completed values', () => {
      expect(topicParamsTransformer(topicWithInfo)[name]).toEqual(
        completedParams[name]
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
      expect(getValue(topicWithInfo, 'some.unsupported.fieldName')).toEqual(
        NaN
      );
    });
  });
  describe('Topic', () => {
    it('return default values when topic not defined found', () => {
      expect(topicParamsTransformer(undefined)).toEqual(DEFAULTS);
    });

    it('return completed values', () => {
      expect(topicParamsTransformer(topicWithInfo)).toEqual(completedParams);
    });
  });

  describe('Topic partitions', () => {
    it('return completed values', () => {
      expect(topicParamsTransformer(topicWithInfo).partitions).toEqual(
        completedParams.partitions
      );
    });
    it('return default values when partitionCount not defined', () => {
      expect(
        topicParamsTransformer({ ...topicWithInfo, partitions: undefined })
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

  describe(`${TOPIC_CUSTOM_PARAMS_PREFIX}`, () => {
    it('return value when configs is empty', () => {
      expect(
        topicParamsTransformer({ ...topicWithInfo, config: [] }).customParams
      ).toEqual([]);
    });

    it('return value when had a 2 custom configs', () => {
      expect(
        topicParamsTransformer({
          ...topicWithInfo,
          config: [
            {
              name: 'segment.bytes',
              value: '1',
              defaultValue: '1073741824',
              source: ConfigSource.DEFAULT_CONFIG,
              isSensitive: false,
              isReadOnly: false,
              synonyms: [
                {
                  name: 'log.segment.bytes',
                  value: '1073741824',
                  source: ConfigSource.DEFAULT_CONFIG,
                },
              ],
            },
            {
              name: 'retention.ms',
              value: '604',
              defaultValue: '604800000',
              source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
              isSensitive: false,
              isReadOnly: false,
              synonyms: [
                {
                  name: 'retention.ms',
                  value: '604800000',
                  source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
                },
              ],
            },
            {
              name: 'flush.messages',
              value: '92233',
              defaultValue: '9223372036854775807',
              source: ConfigSource.DEFAULT_CONFIG,
              isSensitive: false,
              isReadOnly: false,
              synonyms: [
                {
                  name: 'log.flush.interval.messages',
                  value: '9223372036854775807',
                  source: ConfigSource.DEFAULT_CONFIG,
                },
              ],
            },
          ],
        }).customParams?.length
      ).toEqual(2);
    });
  });
});
