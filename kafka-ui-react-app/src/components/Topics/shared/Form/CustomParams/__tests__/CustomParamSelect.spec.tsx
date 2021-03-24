import React from 'react';
import { mount } from 'enzyme';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';
import CustomParamSelect, {
  CustomParamSelectProps,
} from '../CustomParamSelect';

const existingFields = [
  'leader.replication.throttled.replicas',
  'segment.index.bytes',
  'message.timestamp.difference.max.ms',
];

const Wrapper: React.FC<Partial<CustomParamSelectProps>> = (props = {}) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <CustomParamSelect
        index="1"
        name="my_custom_param"
        existingFields={[]}
        isDisabled
        onNameChange={jest.fn()}
        {...props}
      />
    </FormProvider>
  );
};

describe('CustomParamSelect', () => {
  it('renders correct options', () => {
    const fieldsCount = Object.keys(TOPIC_CUSTOM_PARAMS).length;
    const wrapper = mount(<Wrapper existingFields={existingFields} />);
    const options = wrapper.find('option');
    const disabledOptions = options.filterWhere((o) => !!o.prop('disabled'));

    expect(options.length).toEqual(fieldsCount + 1);
    expect(disabledOptions.length).toEqual(existingFields.length);
  });

  it('matches snapshot', () => {
    expect(
      mount(<Wrapper existingFields={existingFields} />).find(
        'Memo(CustomParamSelect)'
      )
    ).toMatchSnapshot();
  });
});
