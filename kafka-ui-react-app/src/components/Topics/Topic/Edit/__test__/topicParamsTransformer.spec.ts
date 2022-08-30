import topicParamsTransformer, {
  getValue,
} from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { externalTopicPayload, topicConfigPayload } from 'lib/fixtures/topics';
import { TOPIC_EDIT_FORM_DEFAULT_PROPS } from 'components/Topics/Topic/Edit/Edit';

const defaultValue = 3232326;
describe('getValue', () => {
  it('returns value when field exists', () => {
    expect(getValue(topicConfigPayload, 'min.insync.replicas')).toEqual(1);
  });
  it('returns default value when field does not exists', () => {
    expect(getValue(topicConfigPayload, 'min.max.mid', defaultValue)).toEqual(
      defaultValue
    );
  });
});

describe('topicParamsTransformer', () => {
  it('returns default values when config payload is not defined', () => {
    expect(topicParamsTransformer(externalTopicPayload)).toEqual(
      TOPIC_EDIT_FORM_DEFAULT_PROPS
    );
  });
  it('returns default values when topic payload is not defined', () => {
    expect(topicParamsTransformer(undefined, topicConfigPayload)).toEqual(
      TOPIC_EDIT_FORM_DEFAULT_PROPS
    );
  });
  it('returns transformed config', () => {
    expect(
      topicParamsTransformer(externalTopicPayload, topicConfigPayload)
    ).toEqual({
      ...TOPIC_EDIT_FORM_DEFAULT_PROPS,
      name: externalTopicPayload.name,
    });
  });
  it('returns default partitions config', () => {
    expect(
      topicParamsTransformer(
        { ...externalTopicPayload, partitionCount: undefined },
        topicConfigPayload
      ).partitions
    ).toEqual(TOPIC_EDIT_FORM_DEFAULT_PROPS.partitions);
  });
  it('returns empty list of custom params', () => {
    expect(
      topicParamsTransformer(externalTopicPayload, topicConfigPayload)
        .customParams
    ).toEqual([]);
  });
  it('returns list of custom params', () => {
    expect(
      topicParamsTransformer(externalTopicPayload, [
        { ...topicConfigPayload[0], value: 'SuperCustom' },
      ]).customParams
    ).toEqual([{ name: 'compression.type', value: 'SuperCustom' }]);
  });
});
