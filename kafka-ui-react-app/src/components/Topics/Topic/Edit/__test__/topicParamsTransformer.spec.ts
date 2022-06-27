import topicParamsTransformer from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';

import { completedParams, topicWithInfo } from './fixtures';

describe('topicParamsTransformer', () => {
  it('topic not found', () => {
    expect(topicParamsTransformer(undefined)).toEqual(DEFAULTS);
  });

  it('topic  found', () => {
    expect(topicParamsTransformer(topicWithInfo)).toEqual(completedParams);
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
  });

  it('topic  minInsyncReplicas', () => {
    expect(topicParamsTransformer(topicWithInfo).minInsyncReplicas).toEqual(
      completedParams.minInsyncReplicas
    );
  });

  it('topic  retentionBytes', () => {
    expect(topicParamsTransformer(topicWithInfo).retentionBytes).toEqual(
      completedParams.retentionBytes
    );
  });

  it('topic  retentionMs', () => {
    expect(topicParamsTransformer(topicWithInfo).retentionMs).toEqual(
      completedParams.retentionMs
    );
  });
});
