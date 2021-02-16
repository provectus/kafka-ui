import React from 'react';
import { shallow } from 'enzyme';
import MessageItem from 'components/Topics/Details/Messages/MessageItem';
import { messages } from './fixtures';

jest.mock('date-fns', () => ({
  format: () => `mocked date`,
}));

describe('MessageItem', () => {
  describe('when content is defined', () => {
    it('renders table row with JSONTree', () => {
      const wrapper = shallow(<MessageItem {...messages[0]} />);

      expect(wrapper.find('tr').length).toEqual(1);
      expect(wrapper.find('td').length).toEqual(4);
      expect(wrapper.find('JSONTree').length).toEqual(1);
    });

    it('matches snapshot', () => {
      expect(shallow(<MessageItem {...messages[0]} />)).toMatchSnapshot();
    });
  });

  describe('when content is undefined', () => {
    it('renders table row without JSONTree', () => {
      const wrapper = shallow(<MessageItem {...messages[1]} />);

      expect(wrapper.find('tr').length).toEqual(1);
      expect(wrapper.find('td').length).toEqual(4);
      expect(wrapper.find('JSONTree').length).toEqual(0);
    });

    it('matches snapshot', () => {
      expect(shallow(<MessageItem {...messages[1]} />)).toMatchSnapshot();
    });
  });
});
