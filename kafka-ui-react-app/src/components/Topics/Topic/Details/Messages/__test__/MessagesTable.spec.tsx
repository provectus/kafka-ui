import React from 'react';
import { shallow } from 'enzyme';
import MessagesTable, {
  MessagesTableProp,
} from 'components/Topics/Topic/Details/Messages/MessagesTable';

import { messages } from './fixtures';

jest.mock('date-fns', () => ({
  format: () => `mocked date`,
}));

describe('MessagesTable', () => {
  const setupWrapper = (props: Partial<MessagesTableProp> = {}) => (
    <MessagesTable messages={[]} onNext={jest.fn()} {...props} />
  );

  describe('when topic is empty', () => {
    it('renders table row with JSONEditor', () => {
      const wrapper = shallow(setupWrapper());
      expect(wrapper.exists('table')).toBeFalsy();
      expect(wrapper.exists('CustomParamButton')).toBeFalsy();
      expect(wrapper.text()).toEqual('No messages at selected topic');
    });

    it('matches snapshot', () => {
      expect(shallow(setupWrapper())).toMatchSnapshot();
    });
  });

  describe('when topic contains messages', () => {
    const onNext = jest.fn();
    const wrapper = shallow(setupWrapper({ messages, onNext }));

    it('renders table row without JSONEditor', () => {
      expect(wrapper.exists('table')).toBeTruthy();
      expect(wrapper.exists('CustomParamButton')).toBeTruthy();
      expect(wrapper.find('MessageItem').length).toEqual(2);
    });

    it('handles CustomParamButton click', () => {
      wrapper.find('CustomParamButton').simulate('click');
      expect(onNext).toHaveBeenCalled();
    });

    it('matches snapshot', () => {
      expect(shallow(setupWrapper({ messages, onNext }))).toMatchSnapshot();
    });
  });
});
