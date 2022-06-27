import topicParamsTransformer, {
  getValue,
} from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';

import { completedParams, topicWithInfo } from './fixtures';

describe('topicParamsTransformer', () => {
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

  it('topic  partitions', () => {
    expect(topicParamsTransformer(topicWithInfo).partitions).toEqual(
      completedParams.partitions
    );
    expect(
      typeof topicParamsTransformer({
        ...topicWithInfo,
        partitionCount: undefined,
      }).partitions
    ).toEqual('number');
  });

  it('topic  maxMessageBytes', () => {
    expect(topicParamsTransformer(topicWithInfo).maxMessageBytes).toEqual(
      completedParams.maxMessageBytes
    );
    expect(
      typeof topicParamsTransformer(topicWithInfo).maxMessageBytes
    ).toEqual('number');
    expect(
      topicParamsTransformer({
        ...topicWithInfo,
        config: topicWithInfo.config?.filter(
          (config) => config.name !== 'max.message.bytes'
        ),
      }).maxMessageBytes
    ).toEqual(completedParams.maxMessageBytes);
  });

  it('topic  minInsyncReplicas', () => {
    expect(topicParamsTransformer(topicWithInfo).minInsyncReplicas).toEqual(
      completedParams.minInsyncReplicas
    );
    expect(
      typeof topicParamsTransformer(topicWithInfo).minInsyncReplicas
    ).toEqual('number');
    expect(
      topicParamsTransformer({
        ...topicWithInfo,
        config: topicWithInfo.config?.filter(
          (config) => config.name !== 'min.insync.replicas'
        ),
      }).minInsyncReplicas
    ).toEqual(completedParams.minInsyncReplicas);
  });

  it('topic  retentionBytes', () => {
    expect(topicParamsTransformer(topicWithInfo).retentionBytes).toEqual(
      completedParams.retentionBytes
    );
    expect(typeof topicParamsTransformer(topicWithInfo).retentionBytes).toEqual(
      'number'
    );
    expect(
      topicParamsTransformer({
        ...topicWithInfo,
        config: topicWithInfo.config?.filter(
          (config) => config.name !== 'retention.bytes'
        ),
      }).retentionBytes
    ).toEqual(completedParams.retentionBytes);
  });

  it('topic  retentionMs', () => {
    expect(topicParamsTransformer(topicWithInfo).retentionMs).toEqual(
      completedParams.retentionMs
    );
    expect(typeof topicParamsTransformer(topicWithInfo).retentionMs).toEqual(
      'number'
    );
    expect(
      topicParamsTransformer({
        ...topicWithInfo,
        config: topicWithInfo.config?.filter(
          (config) => config.name !== 'retention.ms'
        ),
      }).retentionMs
    ).toEqual(-1);
  });
});
